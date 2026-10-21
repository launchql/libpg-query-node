// Cost of (re)instantiating the module per variant + load-time memory.
const dir = process.argv[2]; const factory = require(dir + '/wasm/libpg-query.js');
(async () => {
  const m0 = process.memoryUsage(); const t0 = process.hrtime.bigint();
  let M = await (factory.default || factory)();
  const t1 = process.hrtime.bigint(); const m1 = process.memoryUsage();
  const times = [];
  for (let i = 0; i < 5; i++) { const a = process.hrtime.bigint(); M = await (factory.default || factory)(); times.push(Number(process.hrtime.bigint() - a) / 1e6); }
  if (global.gc) global.gc();
  const m2 = process.memoryUsage();
  console.log(JSON.stringify({ dir: dir.split('/').slice(-2).join('/'), firstLoadMs: Number(t1 - t0) / 1e6, reinstMs: times.map(t => t.toFixed(0)).join('/'), loadExtMB: ((m1.external - m0.external) / 1048576).toFixed(1), rssAfterLoadMB: m1.rss >> 20, rssAfter6LoadsGcMB: m2.rss >> 20, extAfter6LoadsGcMB: (m2.external / 1048576).toFixed(1) }));
})();
