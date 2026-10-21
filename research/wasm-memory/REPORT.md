# libpg-query-node WASM memory research (2026-10-21)

Research only; nothing published, no PRs, no pushes. Harness + raw results live on the research VM at `/home/ubuntu/wasmbench` (gen.js, cell.js, matrix.js, out/*.jsonl); 19 locally built variants under `builds/{17,18}/<variant>` built with `emscripten/emsdk:6.0.3` from the repo's own Makefiles with only the memory flags changed.

Legend used everywhere: **OK** · **clean SqlError** (libpg_query parser error, e.g. Bison `memory exhausted`) · **clean RangeError** (V8 `Maximum call stack size exceeded` thrown while wasm recursion exhausted the *native* thread stack) · **TRAP** (`WebAssembly.RuntimeError`) · **FATAL** (pg_query hit `MAXIMUM_MEMORY` → PostgreSQL FATAL "out of memory" → Emscripten `exit(1)` → JS receives a thrown `ExitStatus` object, which is **not** an `Error`) · **PROCESS OOM / SIGSEGV**.

## 1. Verdict

1. **The Aug 2025 crash was a C (shadow) stack overflow, not heap exhaustion. `-sSTACK_SIZE` is what fixed it. VERIFIED.**
   The pre-fix artifact `libpg-query@17.5.5` has no explicit `STACK_SIZE` (64 KiB Emscripten default; wasm memory section = 16.9 MiB initial / 2 GiB max) and traps on tiny inputs: `SELECT f(f(…1…))` depth 1000 (3 KB), `SELECT 1+1+…` with 1000 terms (5 KB), 300 nested subqueries / CASE / EXISTS, 1000 nested PL/pgSQL IFs. Messages vary (`memory access out of bounds`, `table index is out of bounds`, `null function or function signature mismatch`) because the stack runs down into static data / the indirect-call table (no guard page), and with the default stack a nested-subquery input even **hangs** (100 % CPU, killed at 300 s) instead of trapping. A fresh v18 build with `STACK_SIZE=65536` (`v18-nostack`) reproduces every one of these; the same binary with `STACK_SIZE ≥ 4 MiB` reproduces none. Heap size and `ALLOW_MEMORY_GROWTH` are irrelevant to these traps (`v18-nostack` and `v18-16-4` have identical 16 MiB heaps).

2. **A second, still-live bug exists in every published build (17.7.4, 18.1.5, lowmem-16/32/64): deep inputs poison the module. VERIFIED.**
   Left-deep trees (`a+a+…` ≥ ~10 k terms, ≥ ~100 k `UNION`s or `JOIN`s, ~3 000 nested subqueries) recurse in the wasm → V8 raises a clean `RangeError` when the **native** stack (~1 MB default) runs out. That exception unwinds through the wasm frames without restoring Emscripten's shadow stack pointer or exiting pg_query's memory context. Measured: each failure leaks ~0.8 MiB of shadow stack (sp drift 33.5 MiB after 39 failures on a 32 MiB stack) plus the whole parse memory context (50 MiB per failure for `1+1+…` ×100 k). Repeating the bad input 39–52× on the 32 MiB builds, or **3×** on lowmem-16, flips the next call into a TRAP, and from then on even `parse('SELECT 1')` throws `RuntimeError`. Calling `stackRestore` alone is not enough (the leaked memory contexts then drive the heap to `MAXIMUM_MEMORY` → FATAL). The only safe recovery is to drop the instance and re-instantiate (measured 10–25 ms, load-time external memory is the only cost).

3. **Which stack size is safe depends on the host's native stack, not on the heap.** With Node's default stack every variant ≥ 4 MiB gives clean errors, because V8 overflows first. With `node --stack-size=8000` (8 MB, still under the 8 MiB `ulimit -s`), **4 MiB** traps on `1+1+…` ×30 k and 100 k `UNION`/`JOIN`, **8 MiB** traps on 100 k `JOIN`s, and **16 MiB and 32 MiB never trapped** on any input in the matrix. (`--stack-size=64000` SIGSEGVs Node itself on every build incl. the current default – that is V8 exceeding the OS thread stack, not a libpg-query issue.)

4. **`INITIAL_MEMORY` has no effect on crash behaviour. VERIFIED across all 19 variants.** It only sets the floor: load-time `process.memoryUsage().external` is 19 MiB (16 MiB initial), 29 MiB (24), 35 MiB (32), 67 MiB (64), 131 MiB (128). Peak memory for real work is identical across variants because growth is on.

5. **`MAXIMUM_MEMORY=1 GiB` is hit by ~25–50 MB SQL files today, and raising it does not fix that class of input. VERIFIED.** pg_query needs roughly 10–20× the input size (parse tree + JSON) for files of ordinary statements: 51 MB mixed DDL/DML, 48 MB of `SELECT 1;`, a 26 MB 1 M-member CTE list, and scan/normalize/fingerprint of a 104 MB file all hit the 1 GiB wall → FATAL (`ExitStatus`, `process.exitCode` silently set to 1, module unusable afterwards). With `MAXIMUM_MEMORY=2 GiB`: a 300 MB string literal and 3 M-way `JOIN`/`UNION` chains pass that would FATAL at 1 GiB, but the 104 MB mixed file still FATALs. With 4 GiB (wasm32 ceiling): the 104 MB mixed file still FATALs (ext 3.6 GB when it died), 254 MB `JOIN` chain gets to a clean RangeError. The right fix for huge files is wrapper-side statement splitting (`split`/`scan` then parse in chunks), not a bigger max.

6. **No leak in the normal path.** 200 iterations of parsing a 1 MB / 8 000-statement file: external memory oscillates 66–137 MiB with no upward trend on every variant; 10 MB inputs parsed 20×+ in a loop without growth. Leaks appear only on the exceptional paths in (2).

## 2. Matrix (summary; full per-cell data in matrix.md / matrix.csv)

Rows = inputs, columns = build variants (`init-stack` in MiB, all `MAXIMUM_MEMORY=1 GiB` unless noted). Same result for v17 and v18 wherever both were run. "RangeError" cells are the poisoning path from §1.2.

| input (size) | nostack (64 KiB) | 16-4 | 24-8 / 32-8 | 24-16 / 32-16 | 64-32 / 128-32 (current) |
|---|---|---|---|---|---|
| nest func/case/bool/array/row/coalesce/cast depth 3000 (10–60 KB) | **TRAP** | OK | OK | OK | OK |
| nest subquery 3000 (27 KB) | **HANG** (TIMEOUT) | RangeError | RangeError | RangeError | RangeError |
| any nesting ≥ 10 000 | clean SqlError `memory exhausted` (Bison YYMAXDEPTH) | same | same | same | same |
| `1+1+…` ×100 k (0.5 MB) / `UNION` ×100 k / `JOIN` ×100 k | **TRAP** | RangeError | RangeError | RangeError | RangeError |
| same, `node --stack-size=8000` | **TRAP** | **TRAP** | **TRAP** (JOIN) | OK / RangeError | OK / RangeError |
| `a AND b AND …` ×1 M, `a||b||…`, casts, `x.y.z…`, subscripts | TRAP (concat) / OK | OK | OK | OK | OK |
| IN list 1 M, VALUES 1 M rows (28 MB), select list 1 M, array 1 M | OK (ext 240–950 MiB) | OK | OK | OK | OK |
| CTE list 1 M (26 MB) | FATAL | FATAL | FATAL | FATAL | FATAL |
| 100 MB string literal / 1 MB identifier / 1 MB comment | OK (ext 607 MiB) | OK | OK | OK | OK |
| 10 MB mixed file (20 k stmts) parse / sync / scan / normalize / fingerprint | OK (ext 0.6–1.2 GiB, RSS ≤ 1.5 GiB) | OK | OK | OK | OK |
| 48–51 MB file (5 M `SELECT 1;` or 100 k mixed stmts) | FATAL | FATAL | FATAL | FATAL | FATAL |
| 104 MB mixed file, any op | FATAL | FATAL | FATAL | FATAL | FATAL (also with 2 GiB and 4 GiB max) |
| PL/pgSQL: 1000 nested IF / BEGIN | **TRAP** | OK | OK | OK | OK |
| PL/pgSQL: 10 k nested IF | clean SqlError | same | same | same | same |
| 200× loop over 1 MB file | OK, no growth | OK | OK | OK | OK |
| load-time external MiB | 19 | 19 | 29 / 35 | 29 / 35 | 67 / 131 |

`STACK_OVERFLOW_CHECK=2` (`32-16-soc2`): identical outcomes to `32-16`, +18 KB wasm; it only converts a shadow-stack overflow into an `abort()`, which is still a dead module – not worth shipping in production builds. `ABORTING_MALLOC=0` (`128-32-nam`): no difference (pg_query's own palloc path reports FATAL before malloc returns NULL).

Published artifacts (`pub/*`, same harness): `17.5.5` traps as above; `17.6.0`, `17.7.4`, `18.1.5`, `18.1.5-lowmem-16/32/64` behave exactly like the matching local variant.

## 3. Recommendation

### Flags (all versions 13–18, templates + full)
- `-sSTACK_SIZE=16777216` (16 MiB). Verified never to trap under default Node stack and under `--stack-size=8000`; it is the smallest size that did. 32 MiB is equally safe, costs 16 MiB more of the initial heap. 4 MiB and 8 MiB are **not** safe (traps under a raised native stack; 4 MiB poisons after 3 RangeErrors).
- `-sINITIAL_MEMORY=33554432` (32 MiB) — must be > stack + ~1 MiB static data; 32/16 leaves ~15 MiB heap before the first growth. Load-time external drops 131 → 35 MiB (v18) with zero change in crash behaviour or peak memory. 24/16 also works (29 MiB) but leaves only ~7 MiB of heap before growth; not worth the tighter margin.
- `-sMAXIMUM_MEMORY=1073741824` (keep 1 GiB) **unless** the wrapper also gains statement splitting; 2 GiB buys only the 1–2 GiB band (giant single statements) and doubles worst-case RSS for a runaway input; 4 GiB adds Node/browser ArrayBuffer risk (Safari/Firefox cap at 2–4 GiB, Node needs `--max-old-space-size`-independent native memory) for inputs that still fail. If raised, 2 GiB is the only defensible step and should be opt-in.
- Keep `-sALLOW_MEMORY_GROWTH=1`. Do not add `STACK_OVERFLOW_CHECK` or `ABORTING_MALLOC=0`.
- Optional, cheap, recommended: `-sEXPORTED_RUNTIME_METHODS` += `stackSave,stackRestore` so the wrapper can at least restore the shadow stack pointer (needed by the safeguard below as a first line, re-instantiation as second).

### Wrapper safeguards (these fix bugs that exist regardless of the flag values)
1. In every `parse*/scan/normalize/fingerprint/deparse` call: `const sp = stackSave()` before the wasm call; on **any** non-`SqlError` exception (`RangeError`, `WebAssembly.RuntimeError`, objects with `name === 'ExitStatus'`) do `stackRestore(sp)`, discard `wasmModule`, re-run the factory (`PgQueryModule()`, 10–25 ms), reset `process.exitCode` if the runtime set it, and rethrow as a `SqlError`-compatible error with `cause`. Sync APIs cannot await the re-instantiation: mark the module poisoned, make `*Sync` throw a clear "parser reset in progress, call `loadModule()`" error, and re-instantiate in `loadModule()`/next async call.
2. Convert the FATAL path to a real `Error`: wrap `ExitStatus` (name/message check) into `SqlError('out of memory: input needs more than MAXIMUM_MEMORY')`.
3. Add a statement splitter for big files (already have `scan`; or expose `pg_query_split_with_scanner`) and document "parse files > ~20 MB in chunks".
4. Make sure every template (`templates/index.ts`, `templates/full/index.ts`, v13–v18) frees results in `finally` (they do today) and never caches `HEAPU8` views across calls (they don't; `getValue`/`UTF8ToString` re-read the view each call — stale-view hypothesis **ruled out**).

### Regression tests (adapt from #158 and this harness)
- Memory budget: load-time `external` ≤ 48 MiB (v18, 32/16 build).
- Deep-nesting parity (12 kinds, depth 3000) must be OK; depth 10 000 must be `SqlError`, never `RuntimeError`.
- Poisoning: run `SELECT 1+1+…` (100 k terms) 100× in a loop catching errors, then `parse('SELECT 1')` must succeed — fails on every current build.
- Native-stack headroom: spawn `node --stack-size=8000` and parse 100 k `JOIN`s / 30 k `+` terms → must not be `RuntimeError` (fails on 4 MiB and 8 MiB stacks).
- >MAX: parse a 60 MB `SELECT 1;` file → must throw an `Error` with a message, not an `ExitStatus`, and a following `parse('SELECT 1')` must work.
- Leak loop: 200× parse of a 1 MB file, external memory must not trend upward (allow ±2×).

### Risk to existing users and rollout
- Changing 128/32 → 32/16 alone: zero functional change for every input in the matrix (same OK/error cells), just lower idle memory; the only observable difference is that a long-running process grows the heap on first big input instead of at load. Users on `--stack-size` ≥ 16 MB who feed > 100 k-term chains could trap on 16 MiB where 32 MiB gave a RangeError (which itself poisons the module today) – net risk ≈ 0 once the safeguard above ships.
- The poisoning bug is live in production now and is the bigger user-facing risk (servers that parse untrusted/deep SQL die after a handful of bad inputs). Ship the wrapper fix first or together.
- Rollout: (1) land wrapper safeguards + tests on main, publish normally; (2) publish the 32/16 build under a new tag (`pg18-mem-32-16`) for one release and run the matrix tests against the published tarball; (3) flip the defaults in `templates/Makefile.template` and `copy:templates` for all versions, publish, retire the `lowmem-16` (4 MiB) tag because it is the unsafe one.

### Verified vs inferred
Verified: everything in §1–§2 with numbers (each cell is a fresh Node 24 process, 8-CPU/31 GiB Linux VM, Node default stack unless stated). Inferred: the exact C recursion behind the RangeError (left-deep tree walk in pg_query's JSON output/`raw_expression_tree_walker`; frames are unnamed in release builds); browser ceilings for >2 GiB; that `pg_query_split_*` is the best splitter API. Not run (time-box): v17 variants other than 24-16/128-32 (in flight; same code paths, 17.5.5/17.6.0 published results already match), deparse round-trips (deparse is not exported in the slim build), 100 MB+ files on anything but the 1/2/4 GiB v18 builds.
