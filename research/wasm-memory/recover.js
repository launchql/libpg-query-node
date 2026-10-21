// What does the >1GiB failure look like to JS, and does re-instantiation recover?
const gens = require('./gen.js'); const dir = process.argv[2]; const factory = require(dir + '/wasm/libpg-query.js');
const mk = async () => (factory.default || factory)();
const parse = (M, sql) => { const len = M.lengthBytesUTF8(sql) + 1; const p = M._malloc(len); M.stringToUTF8(sql, p, len); let rp = 0; try { rp = M._wasm_parse_query_raw(p); const err = M.getValue(rp + 8, 'i32'); if (err) throw new Error('SqlError: ' + M.UTF8ToString(M.getValue(err, 'i32')).slice(0, 40)); return M.UTF8ToString(M.getValue(rp, 'i32')).length; } finally { M._free(p); if (rp) M._wasm_free_parse_result(rp); } };
(async () => {
  let M = await mk(); const big = gens.many_mixed(200000); console.log('input MB', (big.length / 1048576).toFixed(0));
  try { parse(M, big); } catch (e) { console.log('throw:', 'instanceof Error =', e instanceof Error, '| name =', e && e.name, '| message =', e && e.message, '| process.exitCode =', process.exitCode, '| M.ABORT =', M.ABORT); }
  try { console.log('same module SELECT 1 ->', parse(M, 'SELECT 1')); } catch (e) { console.log('same module SELECT 1 ->', e && (e.name + ': ' + e.message)); }
  process.exitCode = 0; const t = Date.now(); M = null; const M2 = await mk(); console.log('re-instantiate ms', Date.now() - t);
  console.log('new module SELECT 1 ->', parse(M2, 'SELECT 1'), '| many_mixed 2000 ->', parse(M2, gens.many_mixed(2000)));
})();
