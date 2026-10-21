// After a RangeError (native stack overflow unwinding through wasm frames), is the module poisoned?
const pkg = process.argv[2]; const kind = process.argv[3] || 'chain_arith'; const n = Number(process.argv[4] || 100000);
const gens = require('./gen.js'); const lib = require(pkg);
(async () => {
  await lib.loadModule?.();
  const bad = gens[kind](n);
  let kinds = {};
  for (let i = 0; i < 300; i++) {
    try { await lib.parse(bad); kinds.OK = (kinds.OK||0)+1; } catch (e) { const k = (e instanceof WebAssembly.RuntimeError ? 'TRAP:' : e.constructor.name + ':') + String(e.message).slice(0, 60); kinds[k] = (kinds[k]||0)+1; if (e instanceof WebAssembly.RuntimeError) { console.log('TRAP at iteration', i, e.message); break; } }
  }
  console.log('repeat-bad outcomes:', kinds);
  // now sanity: simple parse + moderately deep parse that normally works
  try { const r = await lib.parse('SELECT 1'); console.log('after: SELECT 1 ->', r.stmts ? 'OK' : JSON.stringify(r).slice(0,80)); } catch (e) { console.log('after: SELECT 1 ->', e.constructor.name, e.message); }
  try { await lib.parse(gens.nest_func(3000)); console.log('after: nest_func(3000) -> OK'); } catch (e) { console.log('after: nest_func(3000) ->', e.constructor.name, e.message); }
  try { await lib.parse(gens.nest_func(7000)); console.log('after: nest_func(7000) -> OK'); } catch (e) { console.log('after: nest_func(7000) ->', e.constructor.name, e.message.slice(0,80)); }
})();
