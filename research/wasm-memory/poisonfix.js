// Drive the emscripten module directly; compare: no restore vs stackRestore-on-error.
const mode = process.argv[2]; const kind = process.argv[3] || 'chain_arith'; const n = Number(process.argv[4] || 100000);
const gens = require('./gen.js'); const factory = require('./patched/v18.1.5/wasm/libpg-query.js');
(async () => {
  const M = await (factory.default || factory)();
  const parse = (sql) => { const len = M.lengthBytesUTF8(sql) + 1; const p = M._malloc(len); M.stringToUTF8(sql, p, len); const sp = M.stackSave();
    let rp = 0; try { rp = M._wasm_parse_query_raw(p); const err = M.getValue(rp + 8, 'i32'); if (err) throw new Error('SqlError ' + M.UTF8ToString(M.getValue(err, 'i32')).slice(0, 40)); return M.UTF8ToString(M.getValue(rp, 'i32')).length; }
    catch (e) { if (mode === 'restore') M.stackRestore(sp); throw e; } finally { M._free(p); if (rp) M._wasm_free_parse_result(rp); } };
  const bad = gens[kind](n); const out = {}; let trapAt = -1; const sp0 = M.stackSave(); const heap0 = M.HEAPU8.length;
  for (let i = 0; i < 300; i++) { try { parse(bad); out.OK = (out.OK || 0) + 1; } catch (e) { const k = (e instanceof WebAssembly.RuntimeError ? 'TRAP:' : e.constructor.name + ':') + e.message.slice(0, 40); out[k] = (out[k] || 0) + 1; if (e instanceof WebAssembly.RuntimeError) { trapAt = i; break; } } }
  console.log(mode, kind, n, JSON.stringify(out), 'trapAt', trapAt, 'sp drift bytes', sp0 - M.stackSave(), 'heap growth MiB', (M.HEAPU8.length - heap0) / 1048576);
  for (const [label, sql] of [['SELECT 1', 'SELECT 1'], ['nest_func 3000', gens.nest_func(3000)], ['nest_func 7000', gens.nest_func(7000)], ['many_mixed 2000', gens.many_mixed(2000)]]) { try { console.log('  after', label, '-> OK', parse(sql)); } catch (e) { console.log('  after', label, '->', e.constructor.name, e.message.slice(0, 60)); } }
  // leak check under restore mode: 2000 more failures, watch heap growth
  if (mode === 'restore') { const h = M.HEAPU8.length; let fails = 0; for (let i = 0; i < 2000; i++) { try { parse(bad); } catch (e) { fails++; if (e instanceof WebAssembly.RuntimeError) { console.log('  TRAP in leak loop at', i, e.message); break; } } } console.log('  leak loop: 2000 iterations, fails', fails, 'heap growth MiB', (M.HEAPU8.length - h) / 1048576, 'rss MiB', process.memoryUsage().rss >> 20); }
})();
