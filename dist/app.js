import { OrbitRenderer, CAMERAS, WORLD_COUNT } from './renderer.js';
import { OrbiteSound, LOOP_COUNT } from './sound.js';
import { WORLDS, PRESETS, remixTitle, buildFlightPlan, getWorld } from './worlds.js';

const $ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));
const lerp = (a, b, t) => a + (b - a) * t;
const frac = (value) => value - Math.floor(value);

const stateKey = 'orbite-state-v3';
const notebookKey = 'orbite-notebook-v1';
const thumbsKey = 'orbite-thumbs-v4';
const harmonicModes = ['auto', 'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'pentatonic'];
const worldKeys = '1234567890-=';
const query = new URLSearchParams(location.search);

let storageAvailable = true;
function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); storageAvailable = true; return true; } catch { storageAvailable = false; return false; }
}

// Each world arrives with its own layers: which of Loopra's thirty-two play there.
function layerMask(world) {
  const mask = Array(LOOP_COUNT).fill(0);
  for (const index of WORLDS[world].sound.layers) mask[index] = 1;
  return mask;
}
function stageFor(world, previous = {}) {
  const sound = WORLDS[world].sound;
  return {
    amount: 100, listening: 'headphones', timbre: 'rich', pad: 70, ...previous,
    size: Math.round(sound.size * 100), walk: Math.round(sound.walk * 100), variation: Math.round(sound.variation * 100),
  };
}

const defaults = {
  world: 0, seed: 714029, speed: 0.35, grain: 0.28, intensity: 0.55, palette: 0, time: 20, travel: 0, mouse: [0, 0],
  camera: 'glide', generated: false, harmonicMode: 'auto', complexity: 0.45,
  layers: layerMask(0), loopDurations: null, stage: stageFor(0), motes: true, holdSound: false,
};

function cleanState(input = {}) {
  if (!input || typeof input !== 'object') input = {};
  const s = { ...defaults, mouse: [0, 0], layers: [...defaults.layers], stage: { ...defaults.stage } };
  for (const k of ['speed', 'grain', 'intensity', 'complexity']) if (Number.isFinite(input[k])) s[k] = clamp(input[k], 0, 1);
  if (Number.isFinite(input.world)) s.world = Math.round(clamp(input.world, 0, WORLD_COUNT - 1));
  if (Number.isFinite(input.palette)) s.palette = Math.round(clamp(input.palette, 0, 5));
  if (Number.isFinite(input.seed)) s.seed = Math.round(clamp(input.seed, 1, 999999));
  if (Number.isFinite(input.time)) s.time = clamp(input.time, 0, 100000);
  if (Number.isFinite(input.travel)) s.travel = clamp(input.travel, 0, 1e6);
  if (Array.isArray(input.mouse) && input.mouse.length === 2 && input.mouse.every(Number.isFinite)) s.mouse = input.mouse.map((v) => clamp(v, -1, 1));
  if (CAMERAS.includes(input.camera)) s.camera = input.camera;
  if (harmonicModes.includes(input.harmonicMode)) s.harmonicMode = input.harmonicMode;
  s.generated = input.generated === true;
  s.motes = input.motes !== false;
  s.holdSound = input.holdSound === true;
  // Older stops (4, 8 or 16 tapes) simply take their world's layers.
  s.layers = Array.isArray(input.layers) && input.layers.length === LOOP_COUNT
    ? input.layers.map((v) => (Number(v) > 0 ? 1 : 0))
    : layerMask(s.world);
  if (Array.isArray(input.loopDurations) && [4, 8, 16, LOOP_COUNT].includes(input.loopDurations.length) && input.loopDurations.every(Number.isFinite)) {
    s.loopDurations = input.loopDurations.map((v) => Math.round(clamp(v, 12, 600)));
  }
  const stage = input.stage && typeof input.stage === 'object' ? input.stage : {};
  s.stage = stageFor(s.world, s.stage);
  for (const k of ['amount', 'walk', 'size', 'variation', 'pad']) if (Number.isFinite(stage[k])) s.stage[k] = Math.round(clamp(stage[k], 0, 100));
  if (['headphones', 'speakers'].includes(stage.listening)) s.stage.listening = stage.listening;
  if (['rich', 'classic'].includes(stage.timbre)) s.stage.timbre = stage.timbre;
  return s;
}

let state = cleanState(readStorage(stateKey, defaults));
// Handy for sharing a link or testing a world: ?world=9&seed=123&camera=glide&time=40&travel=60&palette=4
for (const name of ['world', 'seed', 'time', 'travel', 'palette']) {
  if (query.has(name) && Number.isFinite(Number(query.get(name)))) state = cleanState({ ...state, [name]: Number(query.get(name)), ...(name === 'world' ? { layers: undefined, stage: undefined } : {}) });
}
if (CAMERAS.includes(query.get('camera'))) state.camera = query.get('camera');
if (query.has('motes')) state.motes = query.get('motes') !== '0';

let notebook = readStorage(notebookKey, []);
if (!Array.isArray(notebook)) notebook = [];
notebook = notebook.filter((x) => x && typeof x.id === 'string' && x.state && typeof x.title === 'string').slice(0, 60);

const engines = { loopra: new OrbiteSound({ seed: state.seed }) };
const audio = engines.loopra;
let musicSwitching = false;
let renderer = null;
let paused = matchMedia('(prefers-reduced-motion: reduce)').matches || query.get('paused') === '1';
let time = state.time;
let travel = state.travel;
let toastTimeout;
let saveTimeout;
let recording = null;
let previousStamp = 0;
let mouseTarget = [...state.mouse];
let lastQualityAt = 0;
let frameCount = 0;
let visible = true;
let audioImportVersion = 0;
let audioLoading = false;
let thumbnails = readStorage(thumbsKey, []);
let lastLayerUpdate = 0;
let worldCache = { key: '', value: null };

function currentWorld() {
  const key = [state.world, state.seed, state.generated].join(':');
  if (worldCache.key !== key) worldCache = { key, value: getWorld(state) };
  return worldCache.value;
}

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const layerNames = engines.loopra.getLoopState().map((loop) => loop.name);

// ---- The thirty-two layers ---------------------------------------------------------------
function makeLayerControls() {
  layerNames.forEach((name, i) => {
    const button = document.createElement('button');
    button.className = 'tape-row';
    button.dataset.loop = i;
    if (i === 0) button.classList.add('foundation-row');
    button.innerHTML = `<span class="tape-reel" aria-hidden="true"><i></i></span><span class="tape-label"><strong></strong><span class="tape-track"><i></i></span></span><span class="tape-plane"></span><span class="tape-duration"></span>`;
    button.querySelector('strong').textContent = name;
    button.addEventListener('click', () => {
      state.layers = [...state.layers];
      state.layers[i] = state.layers[i] === 0 ? 1 : 0;
      engines.loopra.setLoopLevel(i, i === 0 ? state.layers[i] * state.stage.pad / 100 : state.layers[i]);
      updateLayers();
      persist();
    });
    $('tapeLoops').append(button);
  });
}

function updateLayers() {
  const loops = engines.loopra.getLoopState();
  const on = state.layers.filter(Boolean).length;
  $('layerCount').textContent = `${on} OF ${LOOP_COUNT} LAYERS`;
  $('musicKey').textContent = audio.isFile ? 'IMPORTED AUDIO' : engines.loopra.currentKey.toUpperCase();
  $('tapeBank').classList.toggle('using-file', audio.isFile);
  $('tapeRecurrence').textContent = audio.isFile ? 'The layers are waiting for your return.' : 'A continuous thread. Unpredictable encounters.';
  document.querySelectorAll('.tape-row').forEach((button, i) => {
    const loop = loops[i];
    const muted = state.layers[i] === 0;
    button.disabled = audio.isFile;
    button.classList.toggle('muted', muted);
    button.classList.toggle('rolling', audio.playing && !muted && !audio.isFile);
    button.classList.toggle('sounding', loop.active);
    button.style.setProperty('--phase', `${(loop.position / loop.duration) * 100}%`);
    button.setAttribute('aria-pressed', String(!muted));
    button.setAttribute('aria-label', `${muted ? 'Unmute' : 'Mute'} ${layerNames[i]}, loop of ${clock(loop.duration)}`);
    button.querySelector('.tape-duration').textContent = clock(loop.duration);
    button.querySelector('.tape-plane').textContent = loop.plane;
    button.title = `${layerNames[i]} · ${clock(loop.position)} / ${clock(loop.duration)} · click to ${muted ? 'unmute' : 'mute'}`;
  });
}

// ---- Sound: the world decides the place, the sliders adjust it -----------------------------
function applyWorldSound() {
  if (state.holdSound) return;
  const world = currentWorld();
  state.layers = layerMask(world.index);
  state.stage = stageFor(world.index, state.stage);
}

function pushSound() {
  const loopra = engines.loopra;
  const sound = currentWorld().sound;
  loopra.setSeed(state.seed);
  loopra.setKey(sound.key);
  loopra.setMusicalMode(state.harmonicMode === 'auto' ? sound.mode : state.harmonicMode);
  loopra.setHarmonyComplexity(state.complexity);
  loopra.setStage({
    amount: state.stage.amount / 100, walk: state.stage.walk / 100, size: state.stage.size / 100, variation: state.stage.variation / 100,
    listening: state.stage.listening, timbre: state.stage.timbre === 'rich',
  });
  if (state.loopDurations && loopra.getLoopState().some((loop, i) => state.loopDurations[i] !== undefined && loop.duration !== state.loopDurations[i])) {
    loopra.setLoopDurations(state.loopDurations);
  }
  state.loopDurations = loopra.getLoopState().map((loop) => loop.duration);
  // The harmonic pad is the foundation: its level is its own, every other layer is on or off.
  state.layers.forEach((level, i) => loopra.setLoopLevel(i, i === 0 ? level * state.stage.pad / 100 : level));
  loopra.setIntensity(state.intensity);
}

function updateAudio() {
  const on = audio.playing;
  $('audioAction').textContent = on ? 'Pause the sound' : audio.isFile ? 'Play your music' : 'Listen to the orbit';
  $('audioName').textContent = audio.isFile ? audio.sourceName : 'Thirty-two loops · a shared key';
  $('audioBtn').querySelector('use').setAttribute('href', on ? '#i-pause' : '#i-play');
  $('miniEq').classList.toggle('playing', on);
  $('resetAudio').hidden = !audio.isFile;
  $('audioBtn').setAttribute('aria-pressed', String(on));
  updateLayers();
  $('rerollLoops').disabled = audio.isFile || !!recording || musicSwitching;
  for (const id of ['modeCycle', 'complexity', 'callUp', 'callDown']) $(id).disabled = audio.isFile || musicSwitching;
  $('modeCycle').title = `Change musical mode · ${state.harmonicMode}`;
}

for (const engine of Object.values(engines)) {
  engine.addEventListener('statechange', (event) => {
    if (engine === audio) {
      updateAudio();
      if (event.detail?.error) toast(event.detail.error, 6000);
    }
  });
}

// ---- Interface helpers --------------------------------------------------------------------
function toast(message, ms = 4000) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => $('toast').classList.remove('show'), ms);
}
function persist() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => writeStorage(stateKey, { ...state, time, travel }), 350);
}
function setSliderProgress(input) { input.style.setProperty('--range', `${((input.value - input.min) / (input.max - input.min)) * 100}%`); }

function sync() {
  const world = currentWorld();
  $('worldTitle').textContent = world.title;
  $('worldSubtitle').textContent = world.subtitle;
  $('coordinates').textContent = world.coordinates;
  $('worldNumber').innerHTML = `${String(state.world + 1).padStart(2, '0')}<span>/ XII</span>`;
  $('stageKicker').textContent = world.tag;
  $('filmBadge').textContent = `STUDY No. ${String((state.seed % 999) + 1).padStart(3, '0')}`;
  $('seedInput').value = state.seed;
  $('camera').value = state.camera;
  $('complexity').value = Math.round(state.complexity * 100);
  $('complexityValue').textContent = Math.round(state.complexity * 100);
  setSliderProgress($('complexity'));
  for (const k of ['speed', 'grain', 'intensity']) {
    $(k).value = Math.round(state[k] * 100);
    $(`${k}Value`).textContent = Math.round(state[k] * 100);
    setSliderProgress($(k));
  }
  for (const k of ['Amount', 'Walk', 'Size', 'Variation', 'Pad']) {
    const value = state.stage[k.toLowerCase()];
    $(`stage${k}`).value = value;
    $(`stage${k}Value`).textContent = value;
    setSliderProgress($(`stage${k}`));
  }
  $('stageListening').value = state.stage.listening;
  $('stageTimbre').value = state.stage.timbre;
  $('motesToggle').setAttribute('aria-pressed', String(state.motes));
  $('motesToggle').classList.toggle('on', state.motes);
  $('holdSound').setAttribute('aria-pressed', String(state.holdSound));
  $('holdSound').classList.toggle('on', state.holdSound);
  document.querySelectorAll('.world-card').forEach((el, i) => {
    el.classList.toggle('active', i === state.world && !state.generated);
    el.setAttribute('aria-pressed', String(i === state.world && !state.generated));
  });
  document.querySelectorAll('.palette-chip').forEach((el) => {
    const active = Number(el.dataset.palette) === state.palette;
    el.classList.toggle('selected', active);
    el.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('.palette-chip[data-palette="0"]').style.setProperty('--swatch', world.palette[1]);
  pushSound();
  updateAudio();
  renderer?.setState({ ...state, travel });
  persist();
}

// All changes of place go through here: the old picture dissolves into the new one.
function go(change) {
  if (recording) return;
  renderer?.beginTransition();
  change();
  mouseTarget = [0, 0];
  sync();
}
function changeWorld(index) {
  go(() => {
    state = { ...state, world: index, generated: false };
    applyWorldSound();
  });
}
function surprise() {
  if (recording) return;
  go(() => {
    const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    let world = preset.world;
    if (world === state.world) world = (world + 1 + Math.floor(Math.random() * (WORLDS.length - 1))) % WORLDS.length;
    state = { ...state, speed: preset.speed, grain: preset.grain, intensity: preset.intensity, generated: true, world, seed: Math.floor(1 + Math.random() * 999998), palette: Math.random() < 0.22 ? 1 : 0 };
    time = 10 + Math.random() * 60;
    travel = Math.random() * 240;
    state.time = time;
    state.travel = travel;
    applyWorldSound();
  });
  toast(`New stop: “${currentWorld().title}”`);
}

function makeWorldCards() {
  $('worldList').replaceChildren();
  WORLDS.forEach((w, i) => {
    const button = document.createElement('button');
    button.className = 'world-card';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `${i + 1}. ${w.title}`);
    const img = document.createElement('img');
    img.className = 'world-thumb';
    img.alt = '';
    img.width = 100;
    img.height = 130;
    img.src = thumbnails[i] || './icon.svg';
    const info = document.createElement('span');
    info.className = 'world-card-text';
    const small = document.createElement('small');
    small.textContent = String(i + 1).padStart(2, '0');
    const strong = document.createElement('strong');
    strong.textContent = w.title;
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = w.tag;
    info.append(small, strong, tag);
    button.append(img, info);
    button.addEventListener('click', () => changeWorld(i));
    $('worldList').append(button);
  });
}

// Thumbnails are drawn one at a time in the background, then remembered.
function loadThumbnails() {
  if (Array.isArray(thumbnails) && thumbnails.length === WORLDS.length && thumbnails.every(safeThumb)) return;
  thumbnails = [];
  let index = 0;
  const step = () => {
    if (!renderer || renderer.lost || index >= WORLDS.length) {
      if (index >= WORLDS.length) writeStorage(thumbsKey, thumbnails);
      return;
    }
    if (!recording && !renderer.transition) {
      thumbnails[index] = renderer.thumbnail(index);
      const image = document.querySelectorAll('.world-thumb')[index];
      if (image) image.src = thumbnails[index];
      index++;
    }
    setTimeout(step, 70);
  };
  setTimeout(step, 400);
}

async function toggleAudio() {
  if (musicSwitching) return;
  try { await audio.toggle(); } catch (error) { toast(error.message); }
}
function toggleVisual() {
  if (recording) return;
  paused = !paused;
  $('pauseVisual').querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
  $('pauseVisual').setAttribute('aria-label', paused ? 'Resume the image' : 'Pause the image');
  $('renderStatus').textContent = paused ? 'IMAGE PAUSED' : 'LIVE RENDER';
  persist();
}
async function fullScreen() {
  const unavailable = 'Fullscreen is unavailable in this panel. Open ORBITE in your browser.';
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if ($('stage').requestFullscreen) await $('stage').requestFullscreen();
    else toast(unavailable);
  } catch { toast(unavailable); }
}

// ---- Taking something away ----------------------------------------------------------------
function downloadBlob(blob, name) {
  if (!blob) { toast('The file could not be created.'); return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
const fileSlug = () => `orbite-${currentWorld().id}-${state.seed}`;
function snapshot(width, height) {
  if (!renderer || renderer.lost) throw new Error('The landscape is unavailable.');
  return renderer.capture(width, height);
}
async function capture() {
  if (recording || !renderer) return;
  const button = $('captureBtn');
  button.disabled = true;
  try {
    await new Promise(requestAnimationFrame);
    const canvas = snapshot(3840, 2160);
    canvas.toBlob((blob) => { downloadBlob(blob, `${fileSlug()}-4K.png`); button.disabled = false; }, 'image/png');
    toast('4K image · 3,840 × 2,160 · your landscape, without the interface.');
  } catch (error) { toast(error.message); button.disabled = false; }
}

function saveNotebook() {
  if (recording) return;
  try {
    const item = {
      id: crypto.randomUUID?.() || String(Date.now()),
      title: state.generated ? currentWorld().title : remixTitle(currentWorld(), state.seed),
      created: new Date().toISOString(),
      state: { ...state, time, travel, mouse: [...renderer.mouse] },
      thumbnail: snapshot(480, 300).toDataURL('image/jpeg', 0.7),
      audio: audio.isFile ? audio.sourceName : null,
    };
    const previous = notebook;
    notebook = [item, ...notebook].slice(0, 60);
    if (!writeStorage(notebookKey, notebook)) {
      notebook = previous;
      toast('The browser is out of space. Export the notebook to make room.');
      return;
    }
    $('savedCount').textContent = notebook.length;
    toast('Stop saved. Find it in your notebook.');
  } catch (error) { toast(error.message); }
}
function safeThumb(value) {
  return typeof value === 'string' && /^data:image\/(?:jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(value) && value.length < 300000 ? value : null;
}
function renderNotebook() {
  const list = $('notebookList');
  list.replaceChildren();
  if (!notebook.length) {
    const div = document.createElement('div');
    div.className = 'empty-carnet';
    div.innerHTML = '<span>◌</span><h3>Everything is still to be discovered.</h3><p>A light, a chord, a happy accident: save your first stop from the studio.</p>';
    list.append(div);
    return;
  }
  notebook.forEach((item) => {
    const data = cleanState(item.state);
    const article = document.createElement('article');
    article.className = 'saved-card';
    const img = document.createElement('img');
    img.src = safeThumb(item.thumbnail) || thumbnails[data.world] || './icon.svg';
    img.alt = getWorld(data).title;
    const body = document.createElement('div');
    body.className = 'saved-body';
    const title = document.createElement('h3');
    title.textContent = item.title.slice(0, 120);
    const meta = document.createElement('p');
    meta.textContent = `${getWorld(data).title} · ${data.seed}`;
    const actions = document.createElement('div');
    actions.className = 'saved-actions';
    const go = document.createElement('button');
    go.textContent = 'Return there ↗';
    go.addEventListener('click', () => {
      renderer?.beginTransition();
      state = data;
      time = data.time;
      travel = data.travel;
      mouseTarget = [...data.mouse];
      if (renderer) renderer.mouse = [...data.mouse];
      sync();
      $('notebookDialog').close();
      toast(item.audio ? `Stop restored. Reimport “${String(item.audio).slice(0, 80)}” for its soundtrack.` : 'Stop restored.');
    });
    const remove = document.createElement('button');
    remove.textContent = 'Delete';
    remove.addEventListener('click', () => {
      notebook = notebook.filter((x) => x.id !== item.id);
      writeStorage(notebookKey, notebook);
      $('savedCount').textContent = notebook.length;
      renderNotebook();
    });
    actions.append(go, remove);
    body.append(title, meta, actions);
    article.append(img, body);
    list.append(article);
  });
}
function exportNotebook() {
  const data = { format: 'orbite-notebook', version: 1, exported: new Date().toISOString(), escales: notebook };
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'orbite-notebook.json');
}
async function importNotebook(file) {
  try {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) throw new Error('The notebook exceeds 20 MB.');
    const data = JSON.parse(await file.text());
    if (!data || data.format !== 'orbite-notebook' || !Array.isArray(data.escales)) throw new Error('This file is not an ORBITE notebook.');
    const valid = data.escales.slice(0, 60).filter((x) => x && x.state && typeof x.title === 'string').map((x) => ({
      id: crypto.randomUUID?.() || String(Math.random()), title: x.title.slice(0, 120), state: cleanState(x.state), thumbnail: safeThumb(x.thumbnail),
      created: typeof x.created === 'string' ? x.created.slice(0, 40) : new Date().toISOString(), audio: typeof x.audio === 'string' ? x.audio.slice(0, 120) : null,
    }));
    const previous = notebook;
    notebook = [...valid, ...notebook].slice(0, 60);
    if (!writeStorage(notebookKey, notebook)) { notebook = previous; throw new Error('The browser has no room for this notebook.'); }
    $('savedCount').textContent = notebook.length;
    renderNotebook();
    toast(`${valid.length} stop(s) imported.`);
  } catch (error) { toast(error instanceof SyntaxError ? 'The JSON file cannot be read.' : error.message); }
}

async function importAudio(file) {
  if (!file || recording) return;
  const version = ++audioImportVersion;
  audioLoading = true;
  updateAudio();
  $('importBtn').disabled = true;
  $('recordBtn').disabled = true;
  try {
    const loaded = await audio.loadFile(file);
    if (loaded && version === audioImportVersion) {
      await audio.start();
      toast('Your music now travels through this world.');
    }
  } catch (error) { toast(error.message, 6000); } finally {
    if (version === audioImportVersion) {
      audioLoading = false;
      $('importBtn').disabled = false;
      $('recordBtn').disabled = !renderer || renderer.lost;
      $('audioFile').value = '';
      updateAudio();
    }
  }
}

// ---- Film ---------------------------------------------------------------------------------
function setRecordingControls(disabled) {
  for (const id of ['discoverBtn', 'camera', 'surpriseBtn', 'saveBtn', 'captureBtn', 'seedInput', 'newSeed', 'speed', 'grain', 'intensity', 'importBtn', 'audioBtn', 'resetAudio', 'pauseVisual', 'notebookBtn']) $(id).disabled = disabled;
  document.querySelectorAll('.world-card,.palette-chip').forEach((el) => { el.disabled = disabled; });
  $('recordBtn').disabled = false;
  updateAudio();
}
function mimeForRecorder() {
  for (const type of ['video/mp4;codecs=avc1.42001E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']) if (MediaRecorder.isTypeSupported(type)) return type;
  return '';
}
function paintFilm(rec, elapsed) {
  const ctx = rec.ctx;
  const w = rec.canvas.width;
  const h = rec.canvas.height;
  ctx.fillStyle = '#0c1211';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage($('universe'), 0, 0, w, h);
  const fade = Math.min(1, elapsed / 0.8, (24 - elapsed) / 1.2);
  ctx.fillStyle = `rgba(8,12,10,${1 - clamp(fade, 0, 1)})`;
  ctx.fillRect(0, 0, w, h);
  const titleAlpha = elapsed < 6 ? Math.min(1, elapsed / 1.5, 6 - elapsed) : elapsed > 20 ? Math.min(1, (elapsed - 20) / 1.5, (24 - elapsed) / 1.2) : 0;
  if (titleAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = titleAlpha;
    const gradient = ctx.createLinearGradient(0, h * 0.5, 0, h);
    gradient.addColorStop(0, '#07161400');
    gradient.addColorStop(1, '#071614b0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ede5d2';
    ctx.font = '15px monospace';
    ctx.fillText(elapsed < 6 ? 'ORBITE / AN ELSEWHERE TO DISCOVER' : 'ORBITE / A TRACE OF THE JOURNEY', 96, h - 158);
    ctx.font = '54px Georgia';
    ctx.fillText(elapsed < 6 ? currentWorld().title : (state.generated ? currentWorld().title : remixTitle(currentWorld(), state.seed)), 96, h - 96);
    ctx.font = '16px monospace';
    ctx.fillStyle = '#d3cbb8';
    ctx.fillText(`No. ${state.seed}   ·   ${currentWorld().coordinates}`, 98, h - 57);
    ctx.restore();
  }
  const chapterIndex = elapsed < 7 ? 0 : elapsed < 17 ? 1 : 2;
  $('recordChapter').textContent = rec.plan[chapterIndex].title;
  $('recordTime').textContent = `00:${String(Math.floor(elapsed)).padStart(2, '0')} / 00:24`;
}
async function startRecording() {
  if (recording) { stopRecording(); return; }
  if (!renderer || renderer.lost) { toast('The landscape is unavailable.'); return; }
  if (audioLoading || musicSwitching) { toast('Your music is still getting ready.'); return; }
  if (!globalThis.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) { toast('This browser cannot record the canvas. Try a recent Chrome or Safari.'); return; }
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  let stream;
  try {
    const type = mimeForRecorder();
    if (!type) throw new Error('No compatible video format. Try Chrome or Safari.');
    stream = canvas.captureStream(30);
    const sound = audio.playing ? audio.getOutputStream() : null;
    sound?.getAudioTracks().forEach((track) => stream.addTrack(track));
    const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 10000000, audioBitsPerSecond: 192000 });
    const rec = { recorder, stream, canvas, ctx: canvas.getContext('2d'), chunks: [], started: performance.now(), pausedBefore: paused, mouseBefore: [...renderer.mouse], timeBefore: time, plan: buildFlightPlan(currentWorld(), state), fileName: fileSlug(), type, failed: false };
    recorder.ondataavailable = (event) => { if (event.data.size) rec.chunks.push(event.data); };
    recorder.onerror = () => { rec.failed = true; toast('Recording was interrupted by the browser.'); stopRecording(); };
    recorder.onstop = () => {
      rec.stream.getTracks().forEach((track) => track.stop());
      if (!rec.failed && rec.chunks.length) {
        downloadBlob(new Blob(rec.chunks, { type: rec.type }), rec.fileName + (rec.type.includes('mp4') ? '.mp4' : '.webm'));
        toast(`Film ready · 1,920 × 1,080 · ${rec.stream.getAudioTracks().length ? 'with your soundtrack.' : 'without a soundtrack.'}`);
      } else if (!rec.failed) toast('The browser produced no video. Try Chrome.');
    };
    recording = rec;
    paused = false;
    renderer.transition = null;
    renderer.canvas.width = 1920;
    renderer.canvas.height = 1080;
    $('stage').classList.add('recording-mode');
    setRecordingControls(true);
    $('recordOverlay').hidden = false;
    $('recordBtn').classList.add('recording');
    $('recordBtn').innerHTML = '<svg><use href="#i-record"/></svg>Finish the film';
    paintFilm(rec, 0);
    recorder.start(500);
    toast('Recording. Keep this tab visible for 24 seconds.', 5000);
    rec.stopTimer = setTimeout(() => stopRecording(), 24100);
  } catch (error) {
    stream?.getTracks().forEach((track) => track.stop());
    if (recording) restoreAfterRecording(recording);
    toast(error.message, 6000);
  }
}
function restoreAfterRecording(rec) {
  clearTimeout(rec.stopTimer);
  recording = null;
  lastQualityAt = 0;
  frameCount = 0;
  paused = rec.pausedBefore;
  if (renderer) { renderer.mouse = rec.mouseBefore; renderer.resize(); }
  setRecordingControls(false);
  $('recordOverlay').hidden = true;
  $('recordBtn').classList.remove('recording');
  $('recordBtn').innerHTML = '<svg><use href="#i-record"/></svg>Film 24 seconds';
  $('stage').classList.remove('recording-mode');
}
function stopRecording() {
  const rec = recording;
  if (!rec) return;
  if (rec.recorder.state !== 'inactive') rec.recorder.stop();
  restoreAfterRecording(rec);
  persist();
}

// ---- The sounds, visible in the landscape --------------------------------------------------
const moteSeeds = Array.from({ length: LOOP_COUNT }, (_, i) => ({
  a: frac(Math.sin(i * 12.9898 + 1.7) * 43758.5453), b: frac(Math.sin(i * 78.233 + 4.1) * 43758.5453), c: frac(Math.sin(i * 39.346 + 9.3) * 43758.5453),
}));
const moteLevel = new Float32Array(LOOP_COUNT);
let loopStateCache = [];
let loopStateAt = 0;
function updateMotes(dt, stamp) {
  if (!state.motes || !audio.playing || audio.isFile) { renderer.setMotes([]); return; }
  if (stamp - loopStateAt > 100) { loopStateCache = engines.loopra.getLoopState(); loopStateAt = stamp; }
  const list = [];
  loopStateCache.forEach((loop, i) => {
    const target = state.layers[i] === 0 ? 0 : loop.active ? 1 : 0.16;
    moteLevel[i] += (target - moteLevel[i]) * (1 - Math.exp(-dt / (target > moteLevel[i] ? 0.18 : 1.8)));
    if (moteLevel[i] < 0.01) return;
    // Near layers are large, soft and wide apart; far ones are small and gather near the horizon.
    const d = loop.depth ?? 0.5;
    const s = moteSeeds[i];
    const sway = time * 0.03 * (0.5 + s.c);
    const x = (s.a * 2 - 1) * lerp(0.72, 0.42, d) + Math.sin(sway + i) * 0.02 * (1 - d) + renderer.mouse[0] * (1 - d) * 0.09;
    const y = lerp((s.b * 2 - 1) * 0.4, -0.03 + (s.b * 2 - 1) * 0.06, d) + Math.cos(sway * 0.7 + i * 1.7) * 0.012 * (1 - d) + renderer.mouse[1] * (1 - d) * 0.04;
    list.push({ x, y, size: lerp(0.052, 0.0065, d), intensity: moteLevel[i] * lerp(0.22, 0.95, Math.sqrt(d)), depth: d, tone: s.c });
  });
  renderer.setMotes(list);
}

// ---- The loop of frames -------------------------------------------------------------------
const glideSpeed = () => 0.1 + 0.85 * state.speed;
function frame(stamp) {
  if (stamp - lastLayerUpdate > 120) { updateLayers(); lastLayerUpdate = stamp; }
  const dt = previousStamp ? Math.min((stamp - previousStamp) / 1000, 0.1) : 0;
  previousStamp = stamp;
  if (renderer && visible && !renderer.lost) {
    if (!paused) {
      time += dt * (recording ? 1.7 : 1);
      travel += dt * glideSpeed() * (recording ? 1.7 : 1);
    }
    renderer.state.travel = travel;
    const levels = audio.getLevels();
    updateMotes(dt, stamp);
    if (recording) {
      const elapsed = Math.min(24, (stamp - recording.started) / 1000);
      renderer.mouse = [Math.sin(elapsed / 24 * Math.PI * 1.5) * 0.7, Math.sin(elapsed / 24 * Math.PI) * 0.25];
      renderer.render(time, levels);
      paintFilm(recording, elapsed);
      if (elapsed >= 24) stopRecording();
    } else {
      renderer.mouse[0] += (mouseTarget[0] - renderer.mouse[0]) * 0.025;
      renderer.mouse[1] += (mouseTarget[1] - renderer.mouse[1]) * 0.025;
      renderer.render(time, levels);
      frameCount++;
      if (stamp - lastQualityAt > 4000) {
        const fps = frameCount / ((stamp - lastQualityAt) / 1000);
        if (lastQualityAt && fps < 22 && renderer.quality > 0.5) { renderer.quality = Math.max(0.5, renderer.quality - 0.1); renderer.resize(); }
        else if (lastQualityAt && fps > 48 && renderer.quality < 0.85) { renderer.quality = Math.min(0.85, renderer.quality + 0.05); renderer.resize(); }
        $('qualityLabel').textContent = `AUTO · ${Math.round(renderer.canvas.width)} px`;
        frameCount = 0;
        lastQualityAt = stamp;
      }
    }
  }
  requestAnimationFrame(frame);
}

// ---- Controls -----------------------------------------------------------------------------
$('rerollLoops').addEventListener('click', () => {
  if (recording) return;
  engines.loopra.rerollLoops();
  state.loopDurations = engines.loopra.getLoopState().map((loop) => loop.duration);
  updateLayers();
  persist();
  toast('New loop lengths. The music continues its journey.');
});
$('camera').addEventListener('change', (event) => { state.camera = event.target.value; renderer?.setState(state); persist(); });
$('modeCycle').addEventListener('click', () => {
  state.harmonicMode = harmonicModes[(harmonicModes.indexOf(state.harmonicMode) + 1) % harmonicModes.length];
  pushSound();
  updateAudio();
  persist();
  toast(state.harmonicMode === 'auto' ? 'The mode follows the world.' : `Mode: ${state.harmonicMode}`);
});
$('complexity').addEventListener('input', (event) => { state.complexity = event.target.value / 100; $('complexityValue').textContent = event.target.value; setSliderProgress(event.target); engines.loopra.setHarmonyComplexity(state.complexity); persist(); });
for (const [id, direction] of [['callUp', 'up'], ['callDown', 'down']]) {
  $(id).addEventListener('click', async () => {
    if (audio.isFile) return;
    try { await engines.loopra.triggerCall(direction); } catch (error) { toast(error.message); }
  });
}
for (const k of ['Amount', 'Walk', 'Size', 'Variation', 'Pad']) {
  $(`stage${k}`).addEventListener('input', (event) => { state.stage = { ...state.stage, [k.toLowerCase()]: Number(event.target.value) }; sync(); });
}
$('stageListening').addEventListener('change', (event) => { state.stage = { ...state.stage, listening: event.target.value }; sync(); });
$('stageTimbre').addEventListener('change', (event) => { state.stage = { ...state.stage, timbre: event.target.value }; sync(); });
$('motesToggle').addEventListener('click', () => { state.motes = !state.motes; sync(); });
$('holdSound').addEventListener('click', () => {
  state.holdSound = !state.holdSound;
  sync();
  toast(state.holdSound ? 'Your sound settings will follow you from world to world.' : 'Each world brings its own sound again.');
});
$('audioBtn').addEventListener('click', toggleAudio);
$('pauseVisual').addEventListener('click', toggleVisual);
$('fullscreenBtn').addEventListener('click', fullScreen);
$('surpriseBtn').addEventListener('click', surprise);
$('discoverBtn').addEventListener('click', surprise);
$('saveBtn').addEventListener('click', saveNotebook);
$('captureBtn').addEventListener('click', capture);
$('recordBtn').addEventListener('click', startRecording);
$('cancelRecord').addEventListener('click', stopRecording);
for (const k of ['speed', 'grain', 'intensity']) $(k).addEventListener('input', (event) => { state[k] = event.target.value / 100; sync(); });
$('volume').addEventListener('input', (event) => { audio.setVolume(event.target.value / 100 * 0.64); setSliderProgress(event.target); });
audio.setVolume(0.32);
setSliderProgress($('volume'));
$('seedInput').addEventListener('change', (event) => {
  state.seed = Number.isFinite(event.target.valueAsNumber) ? Math.round(clamp(event.target.valueAsNumber, 1, 999999)) : defaults.seed;
  sync();
});
$('newSeed').addEventListener('click', () => { state.seed = 1 + Math.floor(Math.random() * 999998); sync(); });
document.querySelectorAll('.palette-chip').forEach((el) => el.addEventListener('click', () => { state.palette = Number(el.dataset.palette); sync(); }));
$('importBtn').addEventListener('click', () => $('audioFile').click());
$('audioFile').addEventListener('change', (event) => importAudio(event.target.files[0]));
$('resetAudio').addEventListener('click', () => { audio.useComposition(); toast('The ORBITE score takes over again.'); });
$('notebookBtn').addEventListener('click', () => { renderNotebook(); $('notebookDialog').showModal(); });
$('studioTab').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
$('aboutBtn').addEventListener('click', () => $('aboutDialog').showModal());
$('helpBtn').addEventListener('click', () => $('helpDialog').showModal());
document.querySelectorAll('.close-dialog').forEach((el) => el.addEventListener('click', () => el.closest('dialog').close()));
document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  }
}));
$('exportNotebook').addEventListener('click', exportNotebook);
$('importNotebook').addEventListener('click', () => $('notebookFile').click());
$('notebookFile').addEventListener('change', async (event) => { await importNotebook(event.target.files[0]); event.target.value = ''; });

let dragDepth = 0;
document.addEventListener('dragenter', (event) => { if (event.dataTransfer?.types.includes('Files')) { event.preventDefault(); dragDepth++; $('dropOverlay').hidden = false; } });
document.addEventListener('dragleave', (event) => { event.preventDefault(); if (--dragDepth <= 0) { dragDepth = 0; $('dropOverlay').hidden = true; } });
document.addEventListener('dragover', (event) => { if (event.dataTransfer?.types.includes('Files')) { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; } });
document.addEventListener('drop', (event) => { event.preventDefault(); dragDepth = 0; $('dropOverlay').hidden = true; importAudio(event.dataTransfer?.files[0]); });
$('stage').addEventListener('pointermove', (event) => {
  if (recording) return;
  const r = $('stage').getBoundingClientRect();
  mouseTarget = [((event.clientX - r.left) / r.width - 0.5) * 2, -((event.clientY - r.top) / r.height - 0.5) * 2];
});
$('stage').addEventListener('pointerleave', () => { mouseTarget = [0, 0]; });
document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.querySelector('dialog[open]')) return;
  if (recording) return;
  const key = event.key.toLowerCase();
  if (key === ' ') { event.preventDefault(); toggleVisual(); }
  else if (key === 'm') toggleAudio();
  else if (key === 's') surprise();
  else if (key === 'f') fullScreen();
  else if (key === '?') $('helpDialog').showModal();
  else if (worldKeys.includes(key) && key.length === 1) changeWorld(worldKeys.indexOf(key));
});
document.addEventListener('visibilitychange', () => {
  visible = !document.hidden;
  previousStamp = 0;
  if (!visible && recording) { toast('Recording ended: the tab was hidden.'); stopRecording(); }
  if (!visible) writeStorage(stateKey, { ...state, time, travel });
});
window.addEventListener('pagehide', () => {
  if (recording) stopRecording();
  writeStorage(stateKey, { ...state, time, travel });
  Object.values(engines).forEach((engine) => engine.stop());
});
$('universe').addEventListener('rendererror', (event) => {
  if (recording) { recording.failed = true; stopRecording(); }
  $('renderStatus').textContent = 'RENDER INTERRUPTED';
  for (const id of ['captureBtn', 'recordBtn', 'saveBtn']) $(id).disabled = true;
  toast(event.detail, 10000);
});
$('universe').addEventListener('worldfailed', () => toast('This landscape could not be drawn on this machine.', 8000));

// ---- Start --------------------------------------------------------------------------------
makeLayerControls();
try {
  renderer = new OrbitRenderer($('universe'));
  renderer.setState({ ...state, travel });
  renderer.mouse = [...state.mouse];
  renderer.resize();
  renderer.render(time);
} catch (error) {
  console.error('ORBITE renderer:', error);
  $('canvasFallback').hidden = false;
  $('renderStatus').textContent = 'RENDER UNAVAILABLE';
  for (const id of ['captureBtn', 'recordBtn', 'saveBtn']) $(id).disabled = true;
}
makeWorldCards();
sync();
$('savedCount').textContent = notebook.length;
if (paused) {
  $('pauseVisual').querySelector('use').setAttribute('href', '#i-play');
  $('renderStatus').textContent = 'IMAGE PAUSED';
}
loadThumbnails();
new ResizeObserver(() => { if (!recording) renderer?.resize(); lastQualityAt = 0; frameCount = 0; }).observe($('stage'));
window.addEventListener('resize', () => { if (!recording) renderer?.resize(); });
requestAnimationFrame(frame);
if (query.has('debug')) window.__orbite = { renderer, engines, get state() { return state; }, get audio() { return audio; }, updateMotes: (dt, stamp = performance.now()) => updateMotes(dt, stamp) };
if (!storageAvailable) toast('Local storage is unavailable; export your stops to keep them.');
