// Minimal pure-Node PNG encoder (no deps) to generate placeholder brand icons.
// Each white-label client replaces these with real brand assets.
import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(size, rgb) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const off = y * (size * 4 + 1) + 1 + x * 4;
      const rounded = Math.min(x, size - 1 - x, y, size - 1 - y);
      const inset = size * 0.04;
      // Simple rounded-square approximation: alpha falloff near corners
      let alpha = 255;
      if (rounded < inset) {
        const dx = x - size / 2 + 0.5;
        const dy = y - size / 2 + 0.5;
        const r = size / 2 - inset;
        const dist = Math.hypot(dx, dy);
        if (dist > r) alpha = Math.max(0, Math.round(255 * (r + inset - dist) / inset));
      }
      raw[off] = rgb[0];
      raw[off + 1] = rgb[1];
      raw[off + 2] = rgb[2];
      raw[off + 3] = alpha;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  const idat = deflateSync(raw);

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, 'apple-touch-icon.png'), encodePNG(180, [15, 23, 42]));
writeFileSync(join(publicDir, 'icon-192.png'), encodePNG(192, [15, 23, 42]));
writeFileSync(join(publicDir, 'icon-512.png'), encodePNG(512, [15, 23, 42]));
console.log('Generated: apple-touch-icon.png, icon-192.png, icon-512.png');