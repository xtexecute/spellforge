// A tiny, original Spellforge-flavored bytebeat. Run: node experiments/bytebeat.js
// The expression uses t as an 8 kHz sample counter and returns an unsigned byte.
const fs = require('node:fs');
const path = require('node:path');

const sampleRate = 8000;
const seconds = 16.384; // Two repetitions of the 8.192-second phrase.
const melody = [6, 8, 9, 12, 9, 8, 6, 4];
const bass = [3, 3, 4, 2];

function bytebeat(t) {
  return (
    (((t * melody[(t >> 12) & 7]) & 255) >> 1) +
    (((t * bass[(t >> 14) & 3]) & 255) >> 2) +
    (((t * 73) ^ (t >> 3)) & 47) * (1 - ((t >> 10) & 3 ? 1 : 0))
  ) & 255;
}

const samples = Buffer.alloc(Math.round(sampleRate * seconds));
for (let t = 0; t < samples.length; t++) {
  // Keep the crunchy 8-bit character at a comfortable playback level.
  samples[t] = Math.max(0, Math.min(255, Math.round(128 + (bytebeat(t) - 128) * 0.68)));
}

const wav = Buffer.alloc(44 + samples.length);
wav.write('RIFF', 0);
wav.writeUInt32LE(wav.length - 8, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate, 28);
wav.writeUInt16LE(1, 32);
wav.writeUInt16LE(8, 34);
wav.write('data', 36);
wav.writeUInt32LE(samples.length, 40);
samples.copy(wav, 44);

const output = path.join(__dirname, 'bytebeat.wav');
fs.writeFileSync(output, wav);
console.log(`Wrote ${output} (${seconds}s, 8-bit mono, ${sampleRate} Hz)`);
