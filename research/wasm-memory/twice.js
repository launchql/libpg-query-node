const dir = process.argv[2]; const factory = require(dir + '/wasm/libpg-query.js'); const gens = require('./gen.js');
const parse = (M, sql) => { const len = M.lengthBytesUTF8(sql) + 1; const p = M._malloc(len); M.stringToUTF8(sql, p, len); let rp = 0; try { rp = M._wasm_parse_query_raw(p); const err = M.getValue(rp + 8, 'i32'); if (err) throw new Error('SqlError: ' + M.UTF8ToString(M.getValue(err, 'i32')).slice(0, 40)); return M.UTF8ToString(M.getValue(rp, 'i32')).length; } finally { M._free(p); if (rp) M._wasm_free_parse_result(rp); } };
(async () => { const mk = () => (factory.default || factory)();
  const M1 = await mk(); console.log('M1', parse(M1, 'SELECT 1')); const M2 = await mk(); console.log('M2', parse(M2, 'SELECT 1')); console.log('M1 again', parse(M1, 'SELECT 1'));
  // now poison M1 with RangeError x60 then check M2
  const bad = gens.chain_arith(100000); let trap = false; for (let i = 0; i < 80 && !trap; i++) { try { parse(M1, bad); } catch (e) { trap = e instanceof WebAssembly.RuntimeError; } }
  console.log('M1 trapped:', trap); try { console.log('M1 SELECT 1 ->', parse(M1, 'SELECT 1')); } catch (e) { console.log('M1 SELECT 1 ->', e.name, e.message.slice(0, 50)); }
  try { console.log('M2 SELECT 1 ->', parse(M2, 'SELECT 1')); } catch (e) { console.log('M2 SELECT 1 ->', e.name, e.message.slice(0, 50)); }
  const M3 = await mk(); try { console.log('M3 (fresh after trap) SELECT 1 ->', parse(M3, 'SELECT 1')); } catch (e) { console.log('M3 ->', e.name, e.message.slice(0, 50)); }
})();
