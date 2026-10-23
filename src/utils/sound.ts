let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const buffer = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export const sfx = {
  click() {
    const c = getCtx();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(600, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(900, c.currentTime + 0.08);
    g.gain.setValueAtTime(0.15, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.12);
  },
  tick() {
    const c = getCtx();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(1050, c.currentTime);
    g.gain.setValueAtTime(0.06, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.08);
  },
  laser() {
    const c = getCtx();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(1400, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(180, c.currentTime + 0.35);
    g.gain.setValueAtTime(0.18, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.4);
  },
  explosion(big = false) {
    const c = getCtx();
    if (!c) return;
    const dur = big ? 1.6 : 0.6;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, dur);
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(big ? 1200 : 900, c.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, c.currentTime + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(big ? 0.6 : 0.35, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.connect(filter).connect(g).connect(c.destination);
    src.start();
    // low boom
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(big ? 90 : 120, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(30, c.currentTime + dur);
    og.gain.setValueAtTime(big ? 0.5 : 0.3, c.currentTime);
    og.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(og).connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  },
  zap() {
    const c = getCtx();
    if (!c) return;
    const dur = 0.7;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, dur);
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2500;
    filter.Q.value = 2;
    const g = c.createGain();
    g.gain.setValueAtTime(0.25, c.currentTime);
    for (let i = 0; i < 8; i++) {
      g.gain.setValueAtTime(i % 2 ? 0.05 : 0.3, c.currentTime + i * 0.08);
    }
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.connect(filter).connect(g).connect(c.destination);
    src.start();
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(220, c.currentTime);
    o.frequency.linearRampToValueAtTime(90, c.currentTime + dur);
    og.gain.setValueAtTime(0.08, c.currentTime);
    og.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(og).connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  },
  win() {
    const c = getCtx();
    if (!c) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      const t = c.currentTime + i * 0.15;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 0.4);
    });
  },
  lose() {
    const c = getCtx();
    if (!c) return;
    const notes = [392, 349, 311, 262];
    notes.forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      const t = c.currentTime + i * 0.2;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 0.5);
    });
  },
};
