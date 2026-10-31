import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height) {
  // Create PNG with dark background #020617 and cyan stork emblem #00F0FF
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      // Background: #020617
      let r = 2;
      let g = 6;
      let b = 23;
      let a = 255;

      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Outer glowing ring
      if (dist >= 70 && dist <= 78) {
        r = 0;
        g = 240;
        b = 255;
      } else if (dist < 70 && dist >= 65) {
        r = 0;
        g = 180;
        b = 220;
      } else if (dist <= 48 && dist >= 44) {
        // Inner ring
        r = 0;
        g = 255;
        b = 157;
      } else if (Math.abs(dx) <= 24 && Math.abs(dy) <= 24) {
        // Central Stork geometric motif
        if (Math.abs(dx + dy) <= 6 || Math.abs(dx - dy) <= 6) {
          r = 0;
          g = 240;
          b = 255;
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuffer = createPng(180, 180);
fs.writeFileSync('public/icon-180.png', pngBuffer);
console.log('Successfully created public/icon-180.png (size:', pngBuffer.length, 'bytes)');
