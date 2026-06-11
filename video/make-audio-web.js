/* Ambient bed for the web-launch explainer: same dreamy chords as the
   device video but a shorter cycle, a soft 100bpm pulse for pace, and
   whooshes on the faster cut grid. */
const fs = require("fs");

const SR = 44100;
const DUR = 47.6;
const N = Math.round(SR * DUR);
const out = new Float32Array(N);

const chords = [
  [130.81, 155.56, 196.0, 261.63],   // Cm
  [103.83, 155.56, 207.65, 311.13],  // Ab
  [116.54, 174.61, 233.08, 293.66],  // Bb add9
  [130.81, 155.56, 196.0, 311.13],   // Cm7
];
const CHORD_LEN = 12;

function env(t, start, len, atk, rel) {
  const x = t - start;
  if (x < 0 || x > len) return 0;
  if (x < atk) return x / atk;
  if (x > len - rel) return (len - x) / rel;
  return 1;
}

for (let i = 0; i < N; i++) {
  const t = i / SR;
  let s = 0;
  const ci = Math.min(chords.length - 1, Math.floor(t / CHORD_LEN));
  const e = env(t, ci * CHORD_LEN, CHORD_LEN, 2.5, 2.5);
  for (const f of chords[ci]) {
    const trem = 0.8 + 0.2 * Math.sin(2 * Math.PI * 0.13 * t + f);
    s += Math.sin(2 * Math.PI * f * t) * 0.5 * trem;
    s += Math.sin(2 * Math.PI * (f * 1.003) * t + 1.7) * 0.4 * trem;
    s += Math.sin(2 * Math.PI * (f * 2.0) * t) * 0.08 * trem;
  }
  s *= e * 0.045;

  // soft pulse (100bpm) through the body for SaaS pace
  if (t > 4.2 && t < 42) {
    const ph = t % 0.6;
    s += Math.exp(-ph / 0.045) * 0.014 * Math.sin(2 * Math.PI * 150 * t);
  }

  // whooshes at segment boundaries
  for (const cut of [4.5, 10.5, 15.5, 22.3, 28.9, 32.6, 36.5, 40.5]) {
    const w = env(t, cut - 0.45, 1.0, 0.45, 0.5);
    if (w > 0) s += (Math.random() * 2 - 1) * 0.022 * w * w;
  }

  s *= env(t, 0, DUR, 1.0, 2.6);
  out[i] = Math.max(-1, Math.min(1, s));
}

const buf = Buffer.alloc(44 + N * 2);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) buf.writeInt16LE(Math.round(out[i] * 32767), 44 + i * 2);
fs.writeFileSync("/tmp/ambient-web.wav", buf);
console.log("wrote /tmp/ambient-web.wav");
