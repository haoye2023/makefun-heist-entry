// Velvet Midnight — tiny synthesised sound effects.
// One job: every blip and chime, made with the Web Audio API, no audio files.
// Sound starts only after the first user gesture, so it never blocks loading.
export function makeAudio() {
  const audio = {
    context: null,
    enabled: true,
    ensure() {
      if (!audio.context) {
        try {
          const Ctor = window.AudioContext || window.webkitAudioContext;
          audio.context = Ctor ? new Ctor() : null;
        } catch {
          audio.context = null;
        }
      }
      if (audio.context && audio.context.state === 'suspended') {
        audio.context.resume().catch(() => {});
      }
      return audio.context;
    },
    tone(freq, duration, type, gainValue, when = 0) {
      if (!audio.enabled) return;
      const ctx = audio.ensure();
      if (!ctx) return;
      const t0 = ctx.currentTime + when;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(gainValue, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.05);
    },
    pickup() {
      audio.tone(880, 0.12, 'sine', 0.12);
      audio.tone(1318, 0.18, 'sine', 0.1, 0.07);
    },
    spotted() {
      audio.tone(220, 0.16, 'square', 0.06);
      audio.tone(175, 0.22, 'square', 0.06, 0.1);
    },
    caught() {
      audio.tone(160, 0.3, 'sawtooth', 0.1);
      audio.tone(110, 0.45, 'sawtooth', 0.1, 0.16);
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => audio.tone(f, 0.22, 'triangle', 0.1, i * 0.09));
    },
    emp() {
      audio.tone(1200, 0.25, 'sine', 0.08);
      audio.tone(300, 0.3, 'sine', 0.07, 0.08);
    },
    coin() {
      audio.tone(1567, 0.09, 'triangle', 0.09);
      audio.tone(2093, 0.12, 'triangle', 0.07, 0.05);
    },
    step() {
      audio.tone(90, 0.05, 'sine', 0.025);
    },
  };
  return audio;
}
