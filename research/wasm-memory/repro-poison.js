// Repro: module poisoned after repeated RangeError. Run against the current main build:
//   cd versions/18 && pnpm build   (or: npm i libpg-query@18.1.5)
//   node research/wasm-memory/repro-poison.js ./versions/18
const lib = require(require('path').resolve(process.argv[2] || 'libpg-query'));
(async () => {
  await lib.loadModule?.();
  const bad = 'SELECT 1' + '+1'.repeat(100000);           // 200 KB, left-deep tree
  for (let i = 0; i < 200; i++) {
    try { await lib.parse(bad); } catch (e) {
      if (e instanceof WebAssembly.RuntimeError) { console.log(`iteration ${i}: ${e.constructor.name}: ${e.message}`); break; }
      if (i === 0) console.log(`iteration 0: ${e.constructor.name}: ${e.message}`); // RangeError: Maximum call stack size exceeded
    }
  }
  try { await lib.parse('SELECT 1'); console.log('SELECT 1: OK'); }
  catch (e) { console.log(`SELECT 1 after poisoning: ${e.constructor.name}: ${e.message}`); process.exitCode = 2; }
})();
