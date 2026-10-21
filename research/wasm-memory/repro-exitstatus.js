// Repro: input larger than MAXIMUM_MEMORY throws an ExitStatus object (not an Error) and sets process.exitCode=1.
//   node research/wasm-memory/repro-exitstatus.js ./versions/18
const lib = require(require('path').resolve(process.argv[2] || 'libpg-query'));
(async () => {
  await lib.loadModule?.();
  const sql = 'SELECT 1;\n'.repeat(5000000);              // 50 MB of trivial statements
  try { await lib.parse(sql); console.log('parsed (unexpected)'); }
  catch (e) { console.log('instanceof Error:', e instanceof Error, '| name:', e && e.name, '| message:', e && e.message, '| process.exitCode:', process.exitCode); }
})();
