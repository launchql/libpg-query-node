# Publishing Guide

## Types Packages

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

## Version Packages

### Quick Publish
```bash
# Set the version (e.g. 17, 16, 15, etc.)
VERSION=17

# Build and publish a specific version
cd versions/${VERSION}
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