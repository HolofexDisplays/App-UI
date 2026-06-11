/* Generates a subtle ambient synth bed (WAV) for the explainer:
   slow-evolving detuned-sine chords + soft whooshes at scene cuts. */
const fs = require("fs");

const SR = 44100;
const DUR = 69.4; // intro (6s) + S2 (8s) + real footage (4.4s) + remaining scenes (51s)
const N = Math.round(SR * DUR);
const out = new Float32Array(N);

// chord progression (Hz), one chord per ~16s, minor/dreamy
const chords = [
  [130.81, 155.56, 196.0, 261.63],   // Cm
  [103.83, 155.56, 207.65, 311.13],  // Ab
  [116.54, 174.61, 233.08, 293.66],  // Bb add9
  [130.81, 155.56, 196.0, 311.13],   // Cm7
];
const CHORD_LEN = 17.35;

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
  const e = env(t, ci * CHORD_LEN, CHORD_LEN, 3.5, 3.5);
  for (const f of chords[ci]) {
    // two detuned sines per voice + slow tremolo
    const trem = 0.8 + 0.2 * Math.sin(2 * Math.PI * 0.11 * t + f);
    s += Math.sin(2 * Math.PI * f * t) * 0.5 * trem;
    s += Math.sin(2 * Math.PI * (f * 1.003) * t + 1.7) * 0.4 * trem;
    s += Math.sin(2 * Math.PI * (f * 2.0) * t) * 0.08 * trem; // faint octave shimmer
  }
  s *= e * 0.045;

  // gentle noise whoosh at each scene boundary
  for (const cut of [5.8, 13.8, 18.2, 26.2, 34.2, 43.2, 50.2, 58.2]) {
    const w = env(t, cut - 0.45, 1.0, 0.45, 0.5);
    if (w > 0) s += (Math.random() * 2 - 1) * 0.022 * w * w;
  }

  // master fade in/out
  s *= env(t, 0, DUR, 1.2, 3.0);
  out[i] = Math.max(-1, Math.min(1, s));
}

// write 16-bit PCM WAV
const buf = Buffer.alloc(44 + N * 2);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) buf.writeInt16LE(Math.round(out[i] * 32767), 44 + i * 2);
fs.writeFileSync("/tmp/ambient.wav", buf);
console.log("wrote /tmp/ambient.wav");
