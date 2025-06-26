# Template Files

This directory contains template files that are shared across all PostgreSQL versions in the `versions/` directory.

## Files

- `LICENSE` - The MIT license file
- `Makefile` - The build configuration with placeholders for version-specific values
- `src/index.ts` - TypeScript entry point
- `src/libpg-query.d.ts` - TypeScript type definitions
- `src/wasm_wrapper.c` - C wrapper for WASM compilation

## Usage

To update the version-specific files from these templates, run:

```bash
npm run copy:templates
```

This script will:
1. Copy all template files to each version directory
2. Replace placeholders with version-specific values
3. Add a header comment to source files indicating they are auto-generated
4. Handle special cases (e.g., the patch command for version 13)

## Placeholders and Flags

The following placeholders are used in template files:

- `{{LIBPG_QUERY_TAG}}` - The libpg_query version tag (e.g., "14-3.0.0")
- `{{#USE_EMSCRIPTEN_PATCH}}...{{/USE_EMSCRIPTEN_PATCH}}` - Conditional block for version-specific patches (currently only used in version 13)

## Important Notes

- DO NOT edit files directly in the `versions/*/` directories for these common files
- Always edit the templates and run the copy script
- The script preserves version-specific configurations while maintaining consistency