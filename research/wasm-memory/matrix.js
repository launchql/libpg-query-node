// Drive cells as child processes (N parallel workers) so OOM/aborts are isolated. Usage: node matrix.js plan.json out.jsonl [workers]
const { spawn } = require('child_process');
const fs = require('fs');
const [planFile, outFile, workersArg] = process.argv.slice(2);
const workers = Number(workersArg || 4);
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
const done = new Set(fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8').split('\n').filter(Boolean).map(l => { const r = JSON.parse(l); return [r.pkg, r.op, r.kind, r.n].join('|'); }) : []);
const queue = plan.filter(c => !done.has([c.label, c.op, c.kind, c.n].join('|')));
let idx = 0, running = 0, finished = 0;
function runOne(c) {
  return new Promise(resolve => {
    const t0 = Date.now(); let stdout = '', stderr = '', timedOut = false;
    const p = spawn('node', [...(c.nodeArgs || []), __dirname + '/cell.js', c.pkg, c.op, c.kind, String(c.n)], { env: { ...process.env, ...(c.env || {}) } });
    const timer = setTimeout(() => { timedOut = true; p.kill('SIGKILL'); }, (c.timeout || 300) * 1000);
    p.stdout.on('data', d => { stdout += d; }); p.stderr.on('data', d => { stderr = (stderr + d).slice(-2000); });
    p.on('close', (status, signal) => {
      clearTimeout(timer); let line;
      const lastJson = stdout.trim().split('\n').filter(l => l.startsWith('{')).pop();
      if (lastJson) { const o = JSON.parse(lastJson); o.pkg = c.label; line = o; }
      else {
        let outcome = 'PROCESS_DIED'; const err = stderr.slice(-400);
        if (timedOut) outcome = 'TIMEOUT';
        else if (/heap out of memory|Reached heap limit|FATAL ERROR|Array buffer allocation failed/i.test(err)) outcome = 'PROCESS_OOM';
        else if (signal) outcome = 'KILLED_' + signal;
        line = { pkg: c.label, op: c.op, kind: c.kind, n: c.n, outcome, exit: status, signal, stderr: err.replace(/\s+/g, ' ') };
      }
      line.wallMs = Date.now() - t0;
      fs.appendFileSync(outFile, JSON.stringify(line) + '\n');
      finished++;
      console.log(`[${finished}/${queue.length}] ${line.pkg} ${line.op} ${line.kind} ${line.n}: ${line.outcome} ${line.error || ''} rss=${line.rssMB} ext=${line.extMB} hwm=${line.hwmMB} ${line.ms}ms`);
      resolve();
    });
  });
}
async function worker() { while (idx < queue.length) { const c = queue[idx++]; await runOne(c); } }
Promise.all(Array.from({ length: workers }, worker)).then(() => console.log('done'));
