# Interim findings (keep updated; survives context summarization)
- Published libpg-query@17.5.5 (June 2025, pre-fix): wasm memory section initial 16.94MiB, max 2048MiB, NO explicit STACK_SIZE => Emscripten default 64KiB stack.
- 17.6.0 / 17.7.4 / 18.1.5: initial 128MiB, max 1024MiB, STACK_SIZE 32MiB. lowmem-16/32/64: 16/32/64MiB initial, max 1GiB.
- REPRO: 17.5.5 traps (WebAssembly.RuntimeError "memory access out of bounds" / "table index is out of bounds" / "null function or function signature mismatch")
  on tiny inputs: nest_func depth 1000 (3KB), nest_subq 300, nest_case 300, nest_exists 300, chain_arith 1000 ("SELECT 1+1+...", 5KB), chain_union 10000, chain_join 1000.
  Varying trap messages = stack overflow running off the 64KiB stack into static data / shadow table (no guard page) -> ROOT CAUSE = C stack overflow, fixed by STACK_SIZE (PR #137), not heap.
- Harness: /home/ubuntu/wasmbench (gen.js inputs, cell.js one cell/subprocess, matrix.js driver, mkplan.js plans, build-variants.sh, finalize.sh). Results in out/*.jsonl. Builds in builds/<ver>/<variant>/ (manifest.jsonl).
- Build time per variant ~6-8 min (LTO link) in emscripten/emsdk:6.0.3 docker; caches in versions/{17,18}/.cache. Docker Hub 429s -> retry loop. Native emsdk 4.0.15 also installed at ~/emsdk (unused).
- Source session of Aug 2025 crash: devin-e8d05071a1c74c978b73c3430a6a1b69 — Dan: "Large SQL inputs sometimes crash with RuntimeError: memory access out of bounds"; no specific file; Dan assumed heap too small.
