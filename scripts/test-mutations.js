#!/usr/bin/env node
// Checks that test/wasm-recovery.test.js covers every branch of the WASM
// recovery code: each mutation below breaks one branch of the built
// wasm/index.cjs, and the tests must fail (or hang) on every one of them.
// Too slow for CI (about 20 s per mutation); run it after changing the
// recovery code in templates/.
//
// usage: pnpm test:mutations [version ...] [--only <text>]   (defaults to 13 and 18)

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const versionsDir = path.join(__dirname, '..', 'versions');
const FINALLY = '        if (failures === failuresBefore) {';

const replace = (from, to) => (source) => source.replace(from, to);
const nth = (source, text, n, to) => {
  let index = -1;
  for (let i = 0; i <= n; i++) index = source.indexOf(text, index + 1);
  return source.slice(0, index) + to + source.slice(index + text.length);
};

const MUTATIONS = [
  ['callWasm: never marks the instance stale', replace('        stale = true;\n', '')],
  ['callWasm: does not count the failure', replace('        failures++;\n', '')],
  ['callWasm: never starts a fresh instance', replace('wasmModule = undefined;\n        instantiate();', 'wasmModule = undefined;\n')],
  ['callWasm: drops the instance on the first failure', replace('if (++staleFailures >= MAX_STALE_FAILURES)', 'if (true)')],
  ['callWasm: never drops a stale instance', replace('if (++staleFailures >= MAX_STALE_FAILURES)', 'if (false)')],
  ['callWasm: cap off by one', replace('if (++staleFailures >= MAX_STALE_FAILURES)', 'if (++staleFailures > MAX_STALE_FAILURES)')],
  ['callWasm: does not restore process.exitCode', replace('        if (proc)\n            proc.exitCode = exitCode;\n', '')],
  ['callWasm: does not remember process.exitCode', replace('const exitCode = proc?.exitCode;', 'const exitCode = undefined;')],
  ['callWasm: wraps every error', replace('if (error instanceof Error)\n            throw error;', 'if (false)\n            throw error;')],
  ['callWasm: never wraps non-Error throws', replace('if (error instanceof Error)\n            throw error;', 'if (true)\n            throw error;')],
  ['callWasm: no constructor-name fallback', replace('(error.message ?? error.constructor?.name)', '(error.message)')],
  ['instantiate: does not reset staleFailures', replace('        staleFailures = 0;\n', '')],
  ['instantiate: does not clear stale', replace('        stale = false;\n        staleFailures', '        staleFailures')],
  ['instantiate: not single-flight', replace('    if (loading)\n        return loading;\n', '')],
  ['instantiate: success never clears loading', replace('        staleFailures = 0;\n        loading = undefined;\n', '        staleFailures = 0;\n')],
  ['instantiate: failure never clears loading', replace('    }, (error) => {\n        loading = undefined;\n', '    }, (error) => {\n')],
  ['instantiate: swallows a failed load', replace('        loading = undefined;\n        throw error;\n', '        loading = undefined;\n')],
  ['loadModule: ignores stale', replace('    while (!wasmModule || stale)\n        await instantiate();\n}', '    while (!wasmModule)\n        await instantiate();\n}')],
  ['loadModule: waits only once', replace('    while (!wasmModule || stale)\n        await instantiate();\n}', '    if (!wasmModule || stale)\n        await instantiate();\n}')],
  ['awaitInit: ignores stale', replace('        while (!wasmModule || stale)\n            await instantiate();', '        while (!wasmModule)\n            await instantiate();')],
  ['awaitInit: waits only once', replace('        while (!wasmModule || stale)\n            await instantiate();', '        if (!wasmModule || stale)\n            await instantiate();')],
];

function functionAt(source, index) {
  const pattern = /^(?:exports\.(\w+) = awaitInit\(async|function (\w+)\()/gm;
  let name;
  for (let match; (match = pattern.exec(source)) && match.index < index;) {
    name = match[1] ? { name: match[1], async: true } : { name: match[2], async: false };
  }
  return name;
}

function mutationsFor(source) {
  const list = [...MUTATIONS];
  for (let n = 0, index = source.indexOf(FINALLY); index !== -1; n++, index = source.indexOf(FINALLY, index + 1)) {
    const fn = functionAt(source, index);
    list.push([`${fn.name} cleanup: frees after the call threw`, (s) => nth(s, FINALLY, n, '        if (true) {')]);
    // An async call only starts on a non-stale instance, so this one can't change async behavior.
    if (!fn.async) {
      list.push([`${fn.name} cleanup: skips frees whenever stale`, (s) => nth(s, FINALLY, n, '        if (!stale) {')]);
    }
  }
  return list;
}

const args = process.argv.slice(2);
const onlyAt = args.indexOf('--only');
const only = onlyAt === -1 ? undefined : args.splice(onlyAt, 2)[1];
const versions = args.length ? args : ['13', '18'];

let problems = 0;
for (const version of versions) {
  const dir = path.join(versionsDir, version);
  const file = path.join(dir, 'wasm', 'index.cjs');
  if (!fs.existsSync(file)) {
    console.error(`v${version}: ${file} not found; build it first`);
    problems++;
    continue;
  }
  const original = fs.readFileSync(file, 'utf8');
  const restore = () => fs.writeFileSync(file, original);
  process.on('SIGINT', () => { restore(); process.exit(130); });
  const mutations = mutationsFor(original).filter(([name]) => !only || name.includes(only));
  let caught = 0;
  try {
    for (const [name, mutate] of mutations) {
      const mutated = mutate(original);
      if (mutated === original) {
        console.log(`NOT APPLIED  v${version}  ${name}`);
        problems++;
        continue;
      }
      fs.writeFileSync(file, mutated);
      const run = spawnSync(process.execPath, ['--test', 'test/wasm-recovery.test.js'], {
        cwd: dir, encoding: 'utf8', timeout: 150000, stdio: ['ignore', 'pipe', 'ignore'],
      });
      const result = run.error?.code === 'ETIMEDOUT' ? 'caught (hangs)' : run.status !== 0 ? 'caught' : 'MISSED';
      if (result === 'MISSED') problems++;
      else caught++;
      console.log(`${result.padEnd(14)} v${version}  ${name}`);
    }
  } finally {
    restore();
  }
  console.log(`v${version}: ${caught}/${mutations.length} mutations caught\n`);
}
process.exit(problems ? 1 : 0);
