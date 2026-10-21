// Which overflows first: V8 native stack (clean RangeError) or the wasm shadow stack (trap)? Vary node --stack-size.
const pkg = process.argv[2]; const kind = process.argv[3]; const n = Number(process.argv[4]);
const gens = require('./gen.js'); const lib = require(pkg);
(async () => {
  await lib.loadModule?.();
  const t = Date.now();
  try { const r = await lib.parse(gens[kind](n)); console.log('OK', JSON.stringify(r).length, Date.now()-t, 'ms'); }
  catch (e) { console.log(e instanceof WebAssembly.RuntimeError ? 'TRAP' : e.constructor.name, String(e.message).slice(0, 70), Date.now()-t, 'ms'); }
})();
