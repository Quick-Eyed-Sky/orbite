import assert from 'node:assert/strict';
import test from 'node:test';
import { OrbiteSound, LOOP_COUNT } from '../dist/sound.js';
import { WORLDS } from '../dist/worlds.js';

test('the sound is Loopra Stage: thirty-two layers, staged, with takes and richer timbres', () => {
  const sound = new OrbiteSound({ seed: 42 });
  assert.equal(LOOP_COUNT, 32);
  assert.equal(sound.getLoopState().length, 32);
  assert.equal(sound.seed, 42);
  assert.equal(sound.stage.timbre, true);
  assert.ok(sound.getLoopState().every((loop) => ['EAR', 'NEAR', 'ROOM', 'HALL', 'FAR'].includes(loop.plane)));
  sound.destroy();
});

test('a new seed is remembered, and the stage settings are clamped', () => {
  const sound = new OrbiteSound({ seed: 1 });
  sound.setSeed(987654);
  assert.equal(sound.seed, 987654);
  sound.setStage({ amount: 3, walk: -1, size: 0.5 });
  assert.equal(sound.stage.amount, 1);
  assert.equal(sound.stage.walk, 0);
  sound.destroy();
});

test('every world can set its key, mode and layers without error', () => {
  const sound = new OrbiteSound({ seed: 7 });
  const names = sound.getLoopState().map((loop) => loop.name);
  assert.equal(new Set(names).size, 32);
  for (const world of WORLDS) {
    assert.equal(sound.setKey(world.sound.key), true, `${world.id}: key`);
    assert.notEqual(sound.setMusicalMode(world.sound.mode), false, `${world.id}: mode`);
    for (let i = 0; i < 32; i++) assert.equal(sound.setLoopLevel(i, world.sound.layers.includes(i) ? 1 : 0), true);
    assert.match(sound.currentKey, /^[A-G]#? (minor|Ionian|Dorian|Phrygian|Lydian|Mixolydian|Pentatonic)$/);
  }
  sound.destroy();
});

test('the harmonic pad starts at 70 % so that it does not mask the other layers', () => {
  const sound = new OrbiteSound({ seed: 3 });
  assert.equal(sound.getLoopState()[0].level, 0.7);
  assert.equal(sound.getLoopState()[1].level, 1);
  sound.destroy();
});

test('Silk & light, a veil that almost never stops, starts at 12 % so that it does not pierce through the others', () => {
  const sound = new OrbiteSound({ seed: 3 });
  const silk = sound.getLoopState().findIndex((loop) => loop.id === 'silk');
  assert.ok(silk > 0, 'the layer exists');
  assert.equal(sound._tapes[silk].trim, 0.12);
  assert.equal(sound._tapes[1].trim, 1, 'other layers are untouched');
  assert.equal(sound.getLoopState()[silk].level, 1, 'it is still an ordinary on/off layer');
  sound.destroy();
});
