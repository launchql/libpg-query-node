# Template Files

This directory contains template files that are shared across all PostgreSQL versions in the `versions/` directory.

## Files

- `LICENSE` - The BSD 3-Clause license file
- `Makefile.template` - The build configuration with placeholders for version-specific values
- `index.ts` - TypeScript entry point
- `libpg-query.d.ts` - TypeScript type definitions
- `wasm_wrapper.c` - C wrapper for WASM compilation

## Usage

To update the version-specific files from these templates, run:

```bash
npm run copy:templates
```

This script will:
1. Copy all template files to each version directory
2. Replace placeholders with version-specific values
3. Add a header comment to source files indicating they are auto-generated
4. Handle special cases (e.g., the emscripten patch for version 13)

## Placeholders

The following placeholders are used in template files:

- `{{VERSION_TAG}}` - The libpg_query version tag (e.g., "14-3.0.0")
- `{{#USE_EMSCRIPTEN_PATCH}}...{{/USE_EMSCRIPTEN_PATCH}}` - Conditional block for version-specific patches (currently only used in version 13)

## Version-Specific Configurations

The `scripts/copy-templates.js` script automatically reads version-specific configurations from each version's `package.json` file. It looks for the `x-publish` section:

```json
"x-publish": {
  "publishName": "libpg-query",
  "pgVersion": "15",
  "distTag": "pg15",
  "libpgQueryTag": "15-4.2.4"
}
```

The script uses:
- `pgVersion` to identify the PostgreSQL version
- `libpgQueryTag` for the {{VERSION_TAG}} placeholder replacement
- Version 13 automatically gets the emscripten patch applied

## Important Notes

- DO NOT edit files directly in the `versions/*/` directories for these common files
- Always edit the templates and run the copy script
- The script preserves version-specific configurations while maintaining consistency
- Generated files will have a header warning about manual modifications