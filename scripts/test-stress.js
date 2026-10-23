#!/usr/bin/env node
// Long-running recovery checks that are too slow for CI. Each scenario runs in
// a fresh Node process with GC exposed and fails if WASM memory (V8 `external`)
// grows, `SELECT 1` stops working, or process.exitCode changes.
//
// usage: pnpm test:stress [version ...]   (defaults to every built version)

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const versionsDir = path.join(__dirname, '..', 'versions');
const MAX_GROWTH = 32 * 1024 * 1024;

const SCENARIOS = {
  'async: 1,000 stack overflows': `
    for (let i = 0; i < 1000; i++) {
      await lib.parse(DEEP).catch(() => {});
      check(i);
    }`,
  'sync: 1,000 stack overflows, awaiting loadModule() after each': `
    for (let i = 0; i < 1000; i++) {
      try { lib.parseSync(DEEP); } catch {}
      await lib.loadModule();
      check(i);
    }`,
  'sync: 200 stack overflows in one synchronous loop, 20 times': `
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 200; j++) { try { lib.parseSync(DEEP); } catch {} }
      await lib.loadModule();
      check(i);
    }`,
  'async: 20 inputs over the 1 GiB WASM limit': `
    for (let i = 0; i < 20; i++) {
      await lib.parse(HUGE).catch(() => {});
      check(i);
    }`,
  'control: 1,000 normal parses': `
    for (let i = 0; i < 1000; i++) {
      await lib.parse('SELECT 1' + '+1'.repeat(2000));
      check(i);
    }`,
};

function runScenario(indexPath, body) {
  const script = `
    const lib = require(${JSON.stringify(indexPath)});
    const DEEP = 'SELECT 1' + '+1'.repeat(100000);
    const HUGE = 'SELECT 1;\\n'.repeat(5000000);
    let broken = null;
    function check(i) {
      try { lib.parseSync('SELECT 1'); } catch { if (broken === null) broken = i; }
    }
    (async () => {
      await lib.loadModule();
      lib.parseSync('SELECT 1');
      gc(); gc();
      const base = process.memoryUsage().external;
      ${body}
      await lib.loadModule();
      await new Promise((resolve) => setTimeout(resolve, 0));
      gc(); gc();
      const grown = process.memoryUsage().external - base;
      process.stdout.write('\\nresult=' + JSON.stringify({ grown, broken, exitCode: process.exitCode ?? null }));
    })();`;
  // libpg_query prints a memory dump to stdout on out-of-memory, so read the marked line.
  const output = execFileSync(process.execPath, ['--expose-gc', '-e', script], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(output.match(/^result=(.*)$/m)[1]);
}

const requested = process.argv.slice(2);
const versions = (requested.length ? requested : fs.readdirSync(versionsDir))
  .filter((v) => fs.existsSync(path.join(versionsDir, v, 'wasm', 'index.cjs')));
if (!versions.length) {
  console.error('No built versions found; run `pnpm build` in versions/<n> first.');
  process.exit(1);
}

let failed = 0;
for (const version of versions) {
  const indexPath = path.join(versionsDir, version, 'wasm', 'index.cjs');
  for (const [name, body] of Object.entries(SCENARIOS)) {
    const start = Date.now();
    let problem;
    let result;
    try {
      result = runScenario(indexPath, body);
      if (result.grown >= MAX_GROWTH) problem = `WASM memory grew by ${(result.grown / 1048576).toFixed(1)} MB`;
      else if (result.broken !== null) problem = `SELECT 1 failed from iteration ${result.broken}`;
      else if (result.exitCode !== null) problem = `process.exitCode became ${result.exitCode}`;
    } catch (error) {
      problem = `process failed: ${error.message.split('\n')[0]}`;
    }
    const seconds = ((Date.now() - start) / 1000).toFixed(1);
    const growth = result ? `${(result.grown / 1048576).toFixed(1)} MB` : '-';
    console.log(`${problem ? 'FAIL' : 'ok  '}  v${version}  ${name}  (${seconds}s, memory ${growth})${problem ? `: ${problem}` : ''}`);
    if (problem) failed++;
  }
}
process.exit(failed ? 1 : 0);
