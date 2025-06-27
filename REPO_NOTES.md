⚠️ Due to the managing of many versions, we do have some duplication, please beware!

There is a templates/ dir to solve some of this.

## Code Duplication 📋

### 1. Identical Test Files
- All `versions/*/test/errors.test.js` files are identical (324 lines each)
- All `versions/*/test/parsing.test.js` files are identical (89 lines each)
- **Recommendation**: Consider using the template approach mentioned by the user

### 2. Nearly Identical Source Files
- `versions/*/src/index.ts` are nearly identical except for version numbers
- `versions/*/src/wasm_wrapper.c` are identical
- `versions/*/Makefile` differ only in:
  - `LIBPG_QUERY_TAG` version
  - Version 13 has an extra emscripten patch

## Consistency Issues 🔧

### 1. Version 13 Makefile Difference
- Version 13 applies an extra patch: `emscripten_disable_spinlocks.patch`
- Other versions don't have this patch
- **Status**: Patch file exists and is likely needed for v13 compatibility