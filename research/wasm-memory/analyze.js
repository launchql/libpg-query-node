// Render matrix.md + matrix.csv from out/*.jsonl
const fs = require('fs');
const files = process.argv.slice(2);
const rows = [];
for (const f of files) for (const l of fs.readFileSync(f, 'utf8').split('\n').filter(Boolean)) { const r = JSON.parse(l); r.src = f.replace(/.*\//, '').replace('.jsonl', ''); rows.push(r); }
const short = o => ({ OK: 'OK', CLEAN_SQLERROR: 'clean SqlError', CLEAN_ERROR: 'clean Error', JS_RANGE_ERROR: 'clean RangeError (JS stack)', WASM_TRAP: 'WASM TRAP', PROCESS_OOM: 'PROCESS OOM', TIMEOUT: 'TIMEOUT', PROCESS_DIED: 'PROCESS DIED' })[o] || o;
const csv = ['build,op,input,n,bytes,outcome,error,ms,peak_rss_mb,external_mb,arraybuffer_mb,hwm_rss_mb,load_external_mb,source'];
for (const r of rows) csv.push([r.pkg, r.op, r.kind, r.n, r.bytes ?? '', r.outcome, JSON.stringify((r.error || r.stderr || '').slice(0, 120)), r.ms ?? '', r.rssMB ?? '', r.extMB ?? '', r.abMB ?? '', r.hwmMB ?? '', r.loadExtMB ?? '', r.src].join(','));
fs.writeFileSync('report/matrix.csv', csv.join('\n'));
// pivot: rows = op/input/n ; cols = builds
const builds = [...new Set(rows.map(r => r.pkg))];
const key = r => `${r.op} ${r.kind} ${r.n}`;
const inputs = [...new Set(rows.map(key))];
const cell = r => r ? `${short(r.outcome)}${r.outcome === 'OK' ? '' : ''} ${r.hwmMB ?? r.rssMB ?? '?'}/${r.extMB ?? '?'}` : '';
let md = `# Crash matrix\n\nCell = outcome, then peak RSS MiB / external MiB (Node \`process.memoryUsage().external\`, includes the wasm heap). Each cell is a fresh Node process.\n\nOutcomes: OK · clean SqlError (libpg_query parser error, e.g. "memory exhausted" from Bison depth limit) · clean RangeError (V8 "Maximum call stack size exceeded" raised while wasm recursion ran out of *native* stack; module is left poisoned, see report) · WASM TRAP (WebAssembly.RuntimeError) · PROCESS OOM · TIMEOUT (>cell timeout).\n\n`;
const groups = {}; for (const r of rows) (groups[r.src] ||= []).push(r);
for (const [src, rs] of Object.entries(groups)) {
  const bs = [...new Set(rs.map(r => r.pkg))]; const ins = [...new Set(rs.map(key))];
  md += `## ${src}\n\n| input | ${bs.join(' | ')} |\n|---|${bs.map(() => '---').join('|')}|\n`;
  for (const i of ins) { md += `| ${i} | ${bs.map(b => cell(rs.find(r => r.pkg === b && key(r) === i))).join(' | ')} |\n`; }
  md += '\n';
}
fs.writeFileSync('report/matrix.md', md);
console.log('rows', rows.length, 'builds', builds.length, 'inputs', inputs.length);
