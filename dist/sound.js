// The sound of ORBITE is Loopra Stage: 32 independent loops in one shared key, each layer
// sitting at its own distance between "at your ears" and "beyond the walls".
// This thin layer only adds what a place needs: a new seed rebuilds the rooms without a click.

import { LoopraAudio, LOOP_COUNT } from './loopra/audio.js';

export { LOOP_COUNT };

export class OrbiteSound extends LoopraAudio {
  constructor(options = {}) {
    super({ features: { stage: true, timbre: true, variation: true }, ...options });
  }

  // A new seed draws new rooms and new takes. While playing, the master dips for an instant
  // so that the old reverberation tails are never cut audibly.
  setSeed(seed) {
    const next = (Number.isInteger(seed) ? seed : this.seed) >>> 0;
    if (next === this.seed) return;
    const context = this._ctx;
    if (!context || !this.playing) {
      super.setSeed(next);
      return;
    }
    const gain = this._master.gain;
    const now = context.currentTime;
    gain.cancelScheduledValues(now);
    gain.setTargetAtTime(0, now, 0.03);
    setTimeout(() => {
      super.setSeed(next);
      gain.setTargetAtTime(this._volume, context.currentTime, 0.25);
    }, 140);
  }
}
