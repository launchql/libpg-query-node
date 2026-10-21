// Print memory section limits + data segment total of a .wasm file
const fs = require('fs');
function leb(buf, p) { let r = 0, s = 0, b; do { b = buf[p++]; r |= (b & 0x7f) << s; s += 7; } while (b & 0x80); return [r >>> 0, p]; }
for (const f of process.argv.slice(2)) {
  const buf = fs.readFileSync(f); let p = 8; const out = { file: f, size: buf.length };
  while (p < buf.length) {
    const id = buf[p++]; let size; [size, p] = leb(buf, p); const end = p + size;
    if (id === 5) { let n, q = p; [n, q] = leb(buf, q); const flags = buf[q++]; let min, max; [min, q] = leb(buf, q); out.initialMiB = min * 64 / 1024; if (flags & 1) { [max, q] = leb(buf, q); out.maxMiB = max * 64 / 1024; } }
    if (id === 11) { let n, q = p; [n, q] = leb(buf, q); let total = 0; for (let i = 0; i < n; i++) { let fl; [fl, q] = leb(buf, q); if (fl === 2) { let mi; [mi, q] = leb(buf, q); } if (fl !== 1) { /* skip init expr: i32.const leb end */ q++; let c; [c, q] = leb(buf, q); q++; } let len; [len, q] = leb(buf, q); total += len; q += len; } out.dataKiB = Math.round(total / 1024); }
    if (id === 0) { let nl, q = p; [nl, q] = leb(buf, q); const name = buf.slice(q, q + nl).toString(); if (name === 'producers' || name === 'emscripten_metadata') out[name] = true; }
    p = end;
  }
  console.log(JSON.stringify(out));
}
