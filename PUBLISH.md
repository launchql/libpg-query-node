# Publishing Guide

## Types Packages

### Quick Publish
```bash
# Build and prepare a specific version
pnpm --filter "@libpg-query/types17" run build
pnpm --filter "@libpg-query/types17" run prepare:types
cd types/17/dist && npm publish

# Or build all types
pnpm run build:types
pnpm run prepare:types
```

### What it does
- Transforms `@libpg-query/types17` → `@pgsql/types` with tag `pg17`
- Transforms `@libpg-query/types16` → `@pgsql/types` with tag `pg16`
- etc.

### Install published packages
```bash
npm install @pgsql/types@pg17  # PostgreSQL 17 types
npm install @pgsql/types@pg16  # PostgreSQL 16 types
```

## Version Packages

### Quick Publish
```bash
# Build and publish a specific version
cd versions/17
pnpm build
pnpm run publish:pkg

# Or manually with custom tag
cd versions/17
pnpm build
TAG=beta node ../../scripts/publish-versions.js
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