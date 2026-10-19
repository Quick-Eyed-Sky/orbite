import assert from 'node:assert/strict';
import test from 'node:test';
import { WORLDS, PRESETS, createWorld, getWorld, seedTraits, remixTitle, buildFlightPlan } from '../dist/worlds.js';

const MODES = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'pentatonic'];
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

test('twelve worlds, each with a place to listen in', () => {
  assert.equal(WORLDS.length, 12);
  assert.equal(new Set(WORLDS.map((world) => world.id)).size, 12);
  WORLDS.forEach((world, index) => {
    assert.equal(world.index, index);
    assert.match(world.id, /^[a-z-]+$/);
    assert.equal(world.palette.length, 3);
    assert.ok(world.palette.every((color) => /^#[0-9a-f]{6}$/i.test(color)));
    assert.ok(KEYS.includes(world.sound.key), `${world.id}: key`);
    assert.ok(MODES.includes(world.sound.mode), `${world.id}: mode`);
    for (const name of ['size', 'walk', 'variation']) assert.ok(world.sound[name] >= 0 && world.sound[name] <= 1, `${world.id}: ${name}`);
    assert.ok(world.sound.layers.length >= 10 && world.sound.layers.length <= 20, `${world.id}: layer count`);
    assert.equal(new Set(world.sound.layers).size, world.sound.layers.length, `${world.id}: layers are unique`);
    assert.ok(world.sound.layers.every((layer) => Number.isInteger(layer) && layer >= 0 && layer < 32), `${world.id}: layer numbers`);
    assert.ok(world.sound.layers.includes(0), `${world.id}: every place keeps the continuous pad`);
  });
});

test('presets point at real worlds and stay in range', () => {
  assert.ok(PRESETS.length >= 12);
  for (const preset of PRESETS) {
    assert.ok(Number.isInteger(preset.world) && preset.world >= 0 && preset.world < 12);
    for (const name of ['speed', 'grain', 'intensity']) assert.ok(preset[name] >= 0 && preset[name] <= 1);
  }
  assert.ok(new Set(PRESETS.map((preset) => preset.world)).size === 12, 'every world has a preset');
});

test('a seed always draws the same place, and another seed another place', () => {
  const a = createWorld(527992, 5);
  const b = createWorld(527992, 5);
  const c = createWorld(527993, 5);
  assert.deepEqual(a, b);
  assert.notEqual(a.title + a.description, c.title + c.description);
  assert.equal(a.generated, true);
  assert.equal(getWorld({ generated: true, seed: 527992, world: 5 }).title, a.title);
});

test('seeds from ORBITE 2.0 keep their look and their names', () => {
  // These two values come from the 2.0.0 release: saved stops must still open the same place.
  assert.equal(seedTraits(714029, 0).geometry, 0.9643073896877468);
  const discovered = createWorld(527992, 5);
  assert.equal(discovered.title, 'The arches of silence');
  assert.equal(discovered.subtitle, 'A memory from far away');
  assert.equal(discovered.coordinates, 'F–527992 · SECTOR 73');
});

test('film cues add up to 24 seconds and every world has a title for any seed', () => {
  for (const world of WORLDS) {
    const plan = buildFlightPlan(world, { speed: 0.4, seed: 91 });
    assert.equal(plan.reduce((sum, cue) => sum + cue.duration, 0), 24);
    assert.ok(plan.every((cue) => cue.title && cue.caption));
    assert.ok(remixTitle(world, 1234).length > 3);
  }
});

test('the interface text is English only', () => {
  const text = JSON.stringify([WORLDS, PRESETS]);
  assert.doesNotMatch(text, /[àâçéèêëîïôùûüœ]/i);
});
