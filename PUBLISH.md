# Publishing Guide

## Automated Publishing (Recommended)

### Version Packages (libpg-query)
```bash
pnpm run publish:versions
```

This interactive script will:
- Check for uncommitted changes (will error if any exist)
- Let you select which versions to publish (or all)
- Also includes the full package (@libpg-query/parser)
- Ask for version bump type (patch or minor only)
- Ask if you want to skip the build step (useful if already built)
- Always run tests (even if build is skipped)
- Publish each selected version
- Optionally promote pg17 to latest

### Types Packages
```bash
pnpm run publish:types
```

This interactive script will:
- Check for uncommitted changes (will error if any exist)
- Let you select which versions to publish (or all)
- Ask for version bump type (patch or minor only)
- Build, prepare, and publish each selected version
- Optionally promote pg17 to latest

### Enums Packages
```bash
pnpm run publish:enums
```

This interactive script will:
- Check for uncommitted changes (will error if any exist)
- Let you select which versions to publish (or all)
- Ask for version bump type (patch or minor only)
- Build, prepare, and publish each selected version
- Optionally promote pg17 to latest

## Manual Publishing

### Types Packages

```bash
# Set the version (e.g. 17, 16, 15, etc.)
VERSION=17

cd types/${VERSION}
pnpm version patch
git add . && git commit -m "release: bump @pgsql/types${VERSION} version"
pnpm build
pnpm prepare:types
pnpm publish --tag pg${VERSION}
```

Promote to latest (optional)

```bash
# Set the version (e.g. 17, 16, 15, etc.)
VERSION=17

# Promote pg${VERSION} tag to latest
npm dist-tag add @pgsql/types@pg${VERSION} latest
```

### What it does
- Transforms `@libpg-query/types17` → `@pgsql/types` with tag `pg17`
- Transforms `@libpg-query/types16` → `@pgsql/types` with tag `pg16`
- etc.

### Enums Packages

```bash
# Set the version (e.g. 17, 16, 15, etc.)
VERSION=17

cd enums/${VERSION}
pnpm version patch
git add . && git commit -m "release: bump @pgsql/enums${VERSION} version"
pnpm build
pnpm prepare:enums
pnpm publish --tag pg${VERSION}
```

Promote to latest (optional)

```bash
# Set the version (e.g. 17, 16, 15, etc.)
VERSION=17

# Promote pg${VERSION} tag to latest
npm dist-tag add @pgsql/enums@pg${VERSION} latest
```

### What it does
- Transforms `@libpg-query/enums17` → `@pgsql/enums` with tag `pg17`
- Transforms `@libpg-query/enums16` → `@pgsql/enums` with tag `pg16`
- etc.

## Version Packages

### Quick Publish
```bash
# Set the version (e.g. 17, 16, 15, etc.)
VERSION=17

# Build and publish a specific version
cd versions/${VERSION}
pnpm version patch
git add . && git commit -m "release: bump libpg-query${VERSION} version"
pnpm build
pnpm test
pnpm run publish:pkg
```

### What it does
- Transforms `@libpg-query/v17` → `libpg-query` with tag `pg17`
- Transforms `@libpg-query/v16` → `libpg-query` with tag `pg16`
- Uses `x-publish.publishName` and `x-publish.distTag` from package.json
- Temporarily modifies package.json during publish, then restores it

### Install published packages
```bash
npm install libpg-query@pg17   # PostgreSQL 17 specific
npm install libpg-query@pg16   # PostgreSQL 16 specific
npm install libpg-query        # Latest/default version
```

## Full Package (@libpg-query/parser)

### Quick Publish
```bash
cd full
pnpm version patch
git add . && git commit -m "release: bump @libpg-query/parser version"
pnpm build
pnpm test
pnpm publish --tag pg17
```

### Promote to latest (optional)
```bash
npm dist-tag add @libpg-query/parser@pg17 latest
```

### What it does
- Publishes `@libpg-query/parser` with tag `pg17`
- Currently based on PostgreSQL 17
- Includes full parser with all features

### Install published package
```bash
npm install @libpg-query/parser@pg17   # PostgreSQL 17 specific
npm install @libpg-query/parser        # Latest version
```