// Run ONE (package, op, input) cell in this process and print a JSON result line.
// argv: pkgDir op kind n [sync]
const fs = require('fs');
const [pkgDir, op, kind, nStr] = process.argv.slice(2);
const n = Number(nStr);
const G = require('./gen.js');
function hwm() { try { const m = /VmHWM:\s+(\d+)/.exec(fs.readFileSync('/proc/self/status', 'utf8')); return Math.round(Number(m[1]) / 1024); } catch { return -1; } }
function mem() { const m = process.memoryUsage(); return { rssMB: Math.round(m.rss / 1048576), extMB: Math.round(m.external / 1048576), abMB: Math.round(m.arrayBuffers / 1048576), heapMB: Math.round(m.heapUsed / 1048576), hwmMB: hwm() }; }
function classify(err) {
  if (err instanceof WebAssembly.RuntimeError) return 'WASM_TRAP';
  if (err && (err.name === 'ExitStatus' || /Program terminated with exit/.test(String(err.message)))) return 'WASM_EXIT_FATAL';
  if (err instanceof RangeError) return 'JS_RANGE_ERROR';
  if (err && err.name === 'SqlError') return 'CLEAN_SQLERROR';
  if (err instanceof Error) return 'CLEAN_ERROR';
  return 'UNKNOWN_THROW';
}
(async () => {
  const t0 = Date.now();
  const sql = G[kind](n);
  const bytes = Buffer.byteLength(sql);
  const q = require(pkgDir);
  await q.loadModule();
  const memLoad = mem();
  const out = { pkg: pkgDir.replace(/.*\/pub\//, '').replace(/.*\/builds\//, 'build:').replace(/\/node_modules.*/, ''), op, kind, n, bytes, loadExtMB: memLoad.extMB };
  let fn;
  switch (op) {
    case 'parse': fn = s => q.parse(s); break;
    case 'parseSync': fn = s => q.parseSync(s); break;
    case 'parsePlPgSQL': fn = s => q.parsePlPgSQL(s); break;
    case 'fingerprint': fn = s => q.fingerprint(s); break;
    case 'normalize': fn = s => q.normalize(s); break;
    case 'scan': fn = s => q.scan(s); break;
    case 'loop': fn = async s => { let last; const iters = Number(process.env.LOOP_ITERS || 200); const samples = []; for (let i = 0; i < iters; i++) { last = await q.parse(s); if (i % Math.max(1, Math.floor(iters / 5)) === 0) samples.push(mem().extMB); } out.loopIters = iters; out.extSamples = samples; return last; }; break;
    default: throw new Error('bad op ' + op);
  }
  if (!q[op === 'loop' ? 'parse' : op]) { out.outcome = 'N/A (op not exported)'; console.log(JSON.stringify(out)); return; }
  const t1 = Date.now();
  try {
    const r = await fn(sql);
    out.outcome = 'OK';
    if (r && r.stmts) out.stmts = r.stmts.length;
    if (typeof r === 'string') out.outLen = r.length;
    if (r && r.tokens) out.tokens = r.tokens.length;
  } catch (e) {
    out.outcome = classify(e);
    out.error = String(e && e.message || e).slice(0, 120);
  }
  out.ms = Date.now() - t1;
  Object.assign(out, mem());
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ pkg: pkgDir, op, kind, n, outcome: 'HARNESS_ERROR', error: String(e && e.stack || e).slice(0, 300) })); });
