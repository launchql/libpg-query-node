const pkg = process.argv[2]; const kind = process.argv[3]; const n = Number(process.argv[4]);
const gens = require('./gen.js'); const lib = require(pkg); Error.stackTraceLimit = 200;
(async () => { await lib.loadModule?.();
  try { await lib.parse(gens[kind](n)); console.log('OK'); }
  catch (e) { const lines = String(e.stack).split('\n'); const wasm = lines.filter(l => /wasm/.test(l)); const names = [...new Set(wasm.map(l => l.trim().replace(/\s+\(.*$/, '').slice(0, 60)))]; console.log(e.constructor.name, e.message.slice(0,60), '| frames:', lines.length, '| distinct wasm frames:', names.slice(0, 12).join(' ; ')); }
})();
