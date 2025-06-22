# Publishing Guide for libpg-query

This guide explains how to publish multiple PostgreSQL version packages under the unified "libpg-query" name using dist-tags.

## Overview

The repository contains multiple PostgreSQL version packages:
- `@libpg-query/v13` → Published as `libpg-query@pg13`
- `@libpg-query/v14` → Published as `libpg-query@pg14`
- `@libpg-query/v15` → Published as `libpg-query@pg15`
- `@libpg-query/v16` → Published as `libpg-query@pg16`
- `@libpg-query/v17` → Published as `libpg-query@pg17`

## Quick Start

### Test Publishing (Dry Run)
```bash
# Test all versions
pnpm publish:dry-run

# Test specific version
node scripts/publish-versions.js --dry-run --versions "17"
```

### Publish All Versions
```bash
pnpm publish:versions
```

### Publish Specific Version
```bash
# Publish PostgreSQL 17 version
pnpm publish:specific 17

# Or directly with the script
node scripts/publish-versions.js --versions "17"
```

## Publishing Examples

### Example 1: Publishing a Single Version with Default Versioning
```bash
# Publish PostgreSQL 17 version with default version (17.0.0)
node scripts/publish-versions.js --versions "17"
```

**What happens:**
1. Script backs up `versions/17/package.json`
2. Temporarily changes name from `@libpg-query/v17` to `libpg-query`
3. Sets version to `17.0.0`
4. Runs `pnpm build` in `versions/17/`
5. Publishes with `pnpm publish --tag pg17`
6. Restores original `package.json`

**Result:** Users can install with `npm install libpg-query@pg17`

### Example 2: Publishing with Custom Version
```bash
# Publish PostgreSQL 16 version with custom version 1.5.2
node scripts/publish-versions.js --versions "16" --set-version "1.5.2"
```

**What happens:**
1. Same process as Example 1, but sets version to `1.5.2` instead of `16.0.0`
2. Published as `libpg-query@pg16` with version `1.5.2`

**Result:** Users can install with `npm install libpg-query@pg16` and get version `1.5.2`

### Example 3: Publishing Multiple Versions
```bash
# Publish PostgreSQL 16 and 17 versions
node scripts/publish-versions.js --versions "16,17" --set-version "2.0.0"
```

**What happens:**
1. Processes both version 16 and 17 packages
2. Both get published with version `2.0.0`
3. Published as `libpg-query@pg16` and `libpg-query@pg17`

### Example 4: Skip Build Step (Pre-built Packages)
```bash
# Publish without building (assumes already built)
node scripts/publish-versions.js --versions "17" --skip-build
```

**Use case:** When packages are already built and you just want to publish.

## Version Management

### Default Versioning
- **Pattern:** `{major}.0.0` where major matches the PostgreSQL version
- **Examples:** 
  - PostgreSQL 13 → `13.0.0`
  - PostgreSQL 17 → `17.0.0`

### Custom Versioning
Use `--set-version` to specify exact version:
```bash
node scripts/publish-versions.js --versions "17" --set-version "1.2.3"
```

### Dist-Tags
- **Format:** `pg{version}`
- **Examples:** `pg13`, `pg14`, `pg15`, `pg16`, `pg17`
- **Purpose:** Allows users to install specific PostgreSQL versions

## Installation After Publishing

Once published, users can install specific PostgreSQL versions:

```bash
# Install PostgreSQL 17 parser
npm install libpg-query@pg17

# Install PostgreSQL 16 parser  
npm install libpg-query@pg16

# Install PostgreSQL 15 parser
npm install libpg-query@pg15

# Install PostgreSQL 14 parser
npm install libpg-query@pg14

# Install PostgreSQL 13 parser
npm install libpg-query@pg13
```

## Workflow Details

### What the Script Does

1. **Discovery:** Automatically finds all version packages in `versions/` directory
2. **Backup:** Creates `.backup` copy of each `package.json`
3. **Modify:** Temporarily changes package name to `libpg-query` and sets version
4. **Build:** Runs `pnpm build` (unless `--skip-build`)
5. **Publish:** Uses `pnpm publish --tag pg{version}`
6. **Restore:** Returns `package.json` to original state
7. **Cleanup:** Removes backup files

### Safety Features

- **Dry-run mode:** Test without publishing (`--dry-run`)
- **Backup/restore:** Original `package.json` files are never permanently modified
- **Error handling:** Failed publishes don't affect other versions
- **Confirmation:** 5-second delay before actual publishing
- **Selective publishing:** Choose specific versions with `--versions`

## Troubleshooting

### Common Issues

**Issue:** "Package already exists"
```bash
# Solution: Use a new version number
node scripts/publish-versions.js --versions "17" --set-version "1.0.1"
```

**Issue:** Build fails
```bash
# Solution: Skip build if already built
node scripts/publish-versions.js --versions "17" --skip-build
```

**Issue:** Want to test first
```bash
# Solution: Always use dry-run first
node scripts/publish-versions.js --dry-run --versions "17" --set-version "1.0.1"
```

### Checking Published Packages

```bash
# Check what versions are available
npm view libpg-query dist-tags

# Check specific version info
npm view libpg-query@pg17
```

## NPM Scripts

The following convenience scripts are available in `package.json`:

```bash
# Test all versions (dry-run)
pnpm publish:dry-run

# Publish all versions  
pnpm publish:versions

# Publish specific versions (you provide the version list)
pnpm publish:specific 16,17
```

## Advanced Usage

### Publishing Workflow for New Release

1. **Update versions in each package** (if needed)
2. **Build all packages:**
   ```bash
   pnpm build:all
   ```
3. **Test publishing:**
   ```bash
   pnpm publish:dry-run
   ```
4. **Publish specific versions:**
   ```bash
   node scripts/publish-versions.js --versions "16,17" --set-version "1.1.0"
   ```

### Batch Publishing with Different Versions

```bash
# Publish v17 with version 2.0.0
node scripts/publish-versions.js --versions "17" --set-version "2.0.0"

# Publish v16 with version 1.9.0  
node scripts/publish-versions.js --versions "16" --set-version "1.9.0"
```

This allows different PostgreSQL versions to have different semantic versions while maintaining the dist-tag system.

## Main Package Publishing (@pgsql/parser)

The main libpg-query package can be published as @pgsql/parser with comprehensive functionality including parse, deparse, parsePlPgSQL, scan, fingerprint, and normalize capabilities.

### Publishing Main Package Examples

#### Example 1: Publishing Main Package (Dry Run)
```bash
# Test publishing main package as @pgsql/parser
node scripts/publish-versions.js --dry-run --main
```

**What happens:**
1. Script backs up `libpg-query/package.json`
2. Temporarily changes name from `libpg-query` to `@pgsql/parser`
3. Keeps existing version (currently 17.3.3)
4. Runs `pnpm build` in `libpg-query/`
5. Would publish with `pnpm publish`
6. Restores original `package.json`

**Result:** Users can install with `npm install @pgsql/parser`

#### Example 2: Publishing with Custom Version
```bash
# Publish main package with version 1.0.0
node scripts/publish-versions.js --main --set-version "1.0.0"
```

#### Example 3: Publishing with Custom Name
```bash
# Publish under different organization
node scripts/publish-versions.js --main --publish-as "@myorg/pg-parser"
```

### Dual Publishing Strategy

This setup enables a dual publishing strategy:

1. **Version-specific packages** (parse-only functionality):
   - `libpg-query@pg13`, `libpg-query@pg14`, etc.
   - Limited to parsing capabilities
   - PostgreSQL version-specific

2. **Comprehensive package** (full functionality):
   - `@pgsql/parser` 
   - Complete feature set: parse, deparse, parsePlPgSQL, scan, fingerprint, normalize
   - Latest PostgreSQL version support

### Installation After Publishing

```bash
# Install comprehensive parser
npm install @pgsql/parser

# Install version-specific parser
npm install libpg-query@pg17
```

### NPM Scripts for Main Package

The following convenience scripts are available for main package publishing:

```bash
# Test main package publishing (dry-run)
pnpm publish:main:dry-run

# Publish main package
pnpm publish:main
```
