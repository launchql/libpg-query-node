# WASM memory research harness (scratch, not shipped)

See REPORT.md for findings and matrix.md / matrix.csv for per-cell results.

- `gen.js` adversarial SQL generators · `cell.js` one cell in a fresh process (outcome + RSS/external) · `matrix.js` parallel driver (`node matrix.js plans/full.json out/full.jsonl 5`) · `mkplan.js` plans · `analyze.js` renders matrix.md/csv
- `build-variants.sh` / `finalize.sh` build `versions/<ver>` with other `WASM_INITIAL_MEMORY/WASM_STACK_SIZE/WASM_MAXIMUM_MEMORY` values in `emscripten/emsdk:6.0.3`
- `repro-poison.js`, `repro-exitstatus.js` minimal repros of the two wrapper bugs; `poisonfix.js` shows stackRestore alone is insufficient; `twice.js`/`recover.js` show re-instantiation recovers
