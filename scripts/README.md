# Scripts Directory

This directory contains various build and maintenance scripts for the libpg-query monorepo.

## Scripts

### copy-templates.js

Copies template files from the `templates/` directory to each PostgreSQL version directory.

**Usage:**
```bash
npm run copy:templates
```

**Features:**
- Processes template placeholders (e.g., `{{LIBPG_QUERY_TAG}}`)
- Handles conditional blocks using mustache-like syntax
- Adds auto-generated headers to source files
- Maintains version-specific configurations

**Version Configurations:**
- Version 13: Uses emscripten patch (`useEmscriptenPatch: true`)
- Versions 14-17: No special patches

### Other Scripts

- `analyze-sizes.js` - Analyzes build artifact sizes
- `fetch-protos.js` - Fetches protocol buffer definitions
- `build-types.js` - Builds TypeScript type definitions
- `prepare-types.js` - Prepares type definitions for publishing
- `build-enums.js` - Builds enum definitions
- `prepare-enums.js` - Prepares enum definitions for publishing
- `publish-types.js` - Publishes @pgsql/types package
- `publish-enums.js` - Publishes @pgsql/enums package
- `publish-versions.js` - Publishes version-specific packages
- `update-versions-types.js` - Updates type dependencies in version packages