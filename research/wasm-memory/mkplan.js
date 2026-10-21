// node mkplan.js <name> -> writes plans/<name>.json
const fs = require('fs'); fs.mkdirSync('plans', { recursive: true });
const pub = v => ({ label: v, pkg: `${__dirname}/pub/${v}/node_modules/libpg-query` });
const build = (ver, variant) => ({ label: `v${ver}-${variant}`, pkg: `${__dirname}/builds/${ver}/${variant}` });
const NEST = ['nest_paren','nest_func','nest_subq','nest_case','nest_bool_r','nest_not','nest_uminus','nest_array','nest_row','nest_exists','nest_coalesce','nest_cast'];
const CHAIN = ['chain_arith','chain_concat','chain_and','chain_and_or','chain_union','chain_union_all','chain_join','chain_cast','chain_dot','chain_subscript'];
const WIDE = ['wide_in','wide_values','wide_select_list','wide_cte','wide_array','long_string','long_ident','long_comment'];
const plans = {};
plans.screen = () => {
  const cells = [];
  for (const p of ['v17.5.5','v17.6.0','v18.1.5','v18.1.5-lowmem-16.0'].map(pub)) {
    for (const k of NEST) for (const n of [100, 300, 1000, 3000, 10000, 100000]) cells.push({ ...p, op: 'parse', kind: k, n, timeout: 120 });
    for (const k of CHAIN) for (const n of [1000, 10000, 100000, 1000000]) cells.push({ ...p, op: 'parse', kind: k, n, timeout: 300 });
    for (const k of WIDE) for (const n of [10000, 100000, 1000000]) cells.push({ ...p, op: 'parse', kind: k, n, timeout: 300 });
    for (const k of ['many_simple','many_mixed']) for (const n of (k === 'many_simple' ? [100000, 1000000] : [2000, 20000])) cells.push({ ...p, op: 'parse', kind: k, n, timeout: 600 });
  }
  return cells;
};
plans.screen18 = () => {
  const cells = [];
  for (const p of ['v18.1.5','v18.1.5-lowmem-16.0'].map(pub)) {
    for (const op of ['parsePlPgSQL']) for (const k of ['nest_plpgsql_if','nest_plpgsql_begin','many_plpgsql']) for (const n of (k === 'many_plpgsql' ? [1000, 10000, 50000] : [100, 300, 1000, 3000, 10000])) cells.push({ ...p, op, kind: k, n, timeout: 300 });
    for (const op of ['fingerprint','normalize','scan','parseSync']) { for (const k of ['nest_func','nest_subq','chain_union','chain_arith']) for (const n of [1000, 10000, 100000]) cells.push({ ...p, op, kind: k, n, timeout: 300 }); for (const k of ['many_mixed']) for (const n of [2000, 20000]) cells.push({ ...p, op, kind: k, n, timeout: 600 }); }
  }
  return cells;
};

// ---- full matrix over locally built variants ----
plans.full = () => {
  const cells = [];
  const V18 = ['nostack','16-4','24-8','24-16','32-8','32-16','64-32','128-32','32-16-soc2','128-32-nam'];
  const V17 = ['nostack','16-4','24-16','32-8','32-16','64-32','128-32'];
  const add = (p, op, kind, n, timeout = 300) => cells.push({ ...p, op, kind, n, timeout });
  const order = [['18','16-4'],['18','24-16'],['18','32-16'],['18','128-32'],['17','24-16'],['17','128-32'],['17','16-4'],['18','nostack'],['18','32-8'],['18','64-32'],['18','32-16-soc2'],['17','nostack'],['17','32-16']];
  for (const [ver, variant] of order) {
    const p = build(ver, variant);
    for (const k of NEST) for (const n of [3000, 100000]) add(p, 'parse', k, n, 120);
    for (const k of CHAIN) for (const n of [100000, 1000000]) add(p, 'parse', k, n);
    for (const k of WIDE) for (const n of [1000000]) add(p, 'parse', k, n);
    for (const k of ['long_string']) add(p, 'parse', k, 100000000, 600);   // 100MB literal
    for (const n of [5000000]) add(p, 'parse', 'many_simple', n, 900);          // 10MB, 50MB
    for (const n of [20000, 100000, 200000]) add(p, 'parse', 'many_mixed', n, 900);      // ~10MB, ~53MB, ~106MB
    add(p, 'loop', 'many_mixed', 2000, 900);
    if (ver === '18') {
      for (const k of ['nest_plpgsql_if','nest_plpgsql_begin']) for (const n of [1000, 10000]) add(p, 'parsePlPgSQL', k, n);
      for (const n of [10000, 30000]) add(p, 'parsePlPgSQL', 'many_plpgsql', n, 600);
      for (const op of ['fingerprint','normalize','scan','parseSync']) { for (const k of ['nest_func','nest_subq','chain_union','chain_arith']) for (const n of [100000]) add(p, op, k, n); for (const n of [20000, 200000]) add(p, op, 'many_mixed', n, 900); }
    }
  }
  return cells;
};
plans.maxmem = () => {
  const cells = [];
  for (const variant of ['128-32','128-32-nam','128-32-max2g','128-32-max4g']) { const p = build('18', variant);
    for (const k of ['chain_join','chain_union','many_mixed','long_string']) for (const n of (k === 'many_mixed' ? [200000, 400000, 800000] : k === 'long_string' ? [300000000, 600000000] : [1000000, 3000000, 6000000])) cells.push({ ...p, op: 'parse', kind: k, n, timeout: 1200, nodeArgs: ['--max-old-space-size=16384'] });
  }
  return cells;
};
plans.cmd = () => { const [, , , label, ver, variant, op, kind, n] = process.argv; return [{ ...build(ver, variant), op, kind, n: Number(n), timeout: 1200 }]; };

plans.bigstack = () => {
  const cells = [];
  for (const variant of ['16-4','24-8','32-8','24-16','32-16','32-16-soc2','64-32','128-32']) for (const ss of [984, 8000, 64000]) {
    const p = { ...build('18', variant), nodeArgs: ['--stack-size=' + ss] }; p.label += `@ss${ss}`;
    for (const [k, n] of [['nest_subq', 3000], ['nest_subq', 10000], ['nest_case', 10000], ['nest_func', 4000], ['chain_arith', 30000], ['chain_union', 100000], ['chain_join', 100000], ['nest_plpgsql_if', 3000]]) cells.push({ ...p, op: k.startsWith('nest_plpgsql') ? 'parsePlPgSQL' : 'parse', kind: k, n, timeout: 150 });
  }
  return cells;
};
const name = process.argv[2]; const cells = plans[name](); fs.writeFileSync(`plans/${name}.json`, JSON.stringify(cells)); console.log(name, cells.length, "cells");
