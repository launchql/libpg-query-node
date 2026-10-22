const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { parse, parseSync, loadModule } = require('../wasm/index.cjs');

// An exception out of the WASM parser skips libpg_query's cleanup. Before the
// wrapper replaced the instance, enough of them made even `SELECT 1` trap.
describe('Recovery after the WASM parser throws', { timeout: 120000 }, () => {
  before(async () => {
    await loadModule();
  });

  it('stays usable after repeated stack overflows on deeply nested SQL', async () => {
    const deep = 'SELECT 1' + '+1'.repeat(100000);
    for (let i = 0; i < 60; i++) {
      await loadModule();
      assert.throws(() => parseSync(deep));
    }
    await loadModule();
    assert.equal(parseSync('SELECT 1').stmts.length, 1);
  });

  it('lets a call queued behind a failing one wait for the fresh instance', async () => {
    await loadModule();
    const [failed, queued] = await Promise.allSettled([
      parse('SELECT 1' + '+1'.repeat(100000)),
      parse('SELECT 1'),
    ]);
    assert.equal(failed.status, 'rejected');
    assert.equal(queued.status, 'fulfilled', queued.reason?.message);
    assert.equal(queued.value.stmts.length, 1);
  });

  it('throws an Error and keeps process.exitCode when the memory limit is hit', async () => {
    const exitCode = process.exitCode;
    await assert.rejects(parse('SELECT 1;\n'.repeat(5000000)), (error) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /out of WASM memory/);
      return true;
    });
    assert.equal(process.exitCode, exitCode);
    assert.equal((await parse('SELECT 1')).stmts.length, 1);
  });

  it('retries the load when loading a fresh instance fails', async () => {
    const indexPath = require.resolve('../wasm/index.cjs');
    const factory = require.cache[require.resolve('../wasm/libpg-query.js')];
    const shared = require.cache[indexPath];
    const realFactory = factory.exports;
    let loads = 0;
    factory.exports = (...args) =>
      ++loads === 2 ? Promise.reject(new Error('simulated load failure')) : realFactory(...args);
    delete require.cache[indexPath];
    let isolated;
    try {
      isolated = require(indexPath);
    } finally {
      factory.exports = realFactory;
      require.cache[indexPath] = shared;
    }
    await isolated.loadModule();
    await assert.rejects(isolated.parse('SELECT 1' + '+1'.repeat(100000)));
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal((await isolated.parse('SELECT 1')).stmts.length, 1);
    assert.equal(loads, 3);
  });
});
