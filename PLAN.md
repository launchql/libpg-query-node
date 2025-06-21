# Multi-Version PostgreSQL Support Plan

## Overview

This document outlines the architecture for supporting multiple PostgreSQL versions (PG13-17) in the libpg-query ecosystem using a folder-based structure. The plan creates lightweight versions for PG13-16 (without deparse/scan functionality), a full-featured PG17 version, and a multi-version package combining PG15/16/17.

## Current Architecture Analysis

### PG17 (Current Implementation)
- **WASM-only build system** using Emscripten
- **Full functionality**: parse, deparse, scan, fingerprint, normalize, parsePlPgSQL
- **Protocol Buffer integration** via 5.4MB proto.js file for deparse operations
- **Key WASM exports**: `wasm_deparse_protobuf`, `wasm_scan`, `wasm_parse_query_protobuf`
- **Dependencies**: `@pgsql/types@^17.0.0`, `@launchql/protobufjs@7.2.6`

### Version Differences Identified
- **PG17**: Uses `LIBPG_QUERY_TAG := 17-6.1.0` with pure WASM wrapper (`src/wasm_wrapper.c`)
- **PG15**: Uses `LIBPG_QUERY_TAG := 15-4.2.4` with hybrid C++/WASM approach (`src/*.cc`)
- **Build system**: PG17 excludes native builds entirely, PG15 supports node-gyp fallback

## Proposed Folder Structure

```
libpg-query-multi/
├── libpg-query-13/          # Lightweight - no deparse/scan
│   ├── src/
│   │   └── wasm_wrapper_light.c
│   ├── wasm/
│   │   ├── index.js         # Lightweight API
│   │   └── index.d.ts
│   ├── package.json         # @pgsql/types@^13.0.0
│     ├── Makefile            # LIBPG_QUERY_TAG := 13-2.2.0
│   └── README.md
├── libpg-query-14/          # Lightweight - no deparse/scan
│   ├── src/
│   │   └── wasm_wrapper_light.c
│   ├── wasm/
│   │   ├── index.js         # Lightweight API
│   │   └── index.d.ts
│   ├── package.json         # @pgsql/types@^14.0.0
│     ├── Makefile            # LIBPG_QUERY_TAG := 14-3.0.0
│   └── README.md
├── libpg-query-15/          # Lightweight - no deparse/scan
│   ├── src/
│   │   └── wasm_wrapper_light.c
│   ├── wasm/
│   │   ├── index.js         # Lightweight API
│   │   └── index.d.ts
│   ├── package.json         # @pgsql/types@^15.0.0
│   ├── Makefile            # LIBPG_QUERY_TAG := 15-4.2.4
│   └── README.md
├── libpg-query-16/          # Lightweight - no deparse/scan
│   ├── src/
│   │   └── wasm_wrapper_light.c
│   ├── wasm/
│   │   ├── index.js         # Lightweight API
│   │   └── index.d.ts
│   ├── package.json         # @pgsql/types@^16.0.0
│     ├── Makefile            # LIBPG_QUERY_TAG := 16-5.2.0
│   └── README.md
├── libpg-query-full/        # PG17 - full functionality
│   ├── src/
│   │   └── wasm_wrapper.c   # Full WASM wrapper
│   ├── wasm/
│   │   ├── index.js         # Full API with deparse/scan
│   │   └── index.d.ts
│   ├── scripts/
│   │   └── protogen.js      # Protocol buffer generation
│   ├── proto.js             # 5.4MB Protocol Buffer definitions
│   ├── package.json         # @pgsql/types@^17.0.0
│   ├── Makefile            # LIBPG_QUERY_TAG := 17-6.1.0
│   └── README.md
├── libpg-query-multi/       # PG15/16/17 in single package
│   ├── pg15/               # Lightweight PG15
│   ├── pg16/               # Lightweight PG16  
│   ├── pg17/               # Full PG17
│   ├── index.js            # Version selector API
│   ├── package.json        # Multi-version exports
│   ├── Makefile           # Builds all three versions
│   └── README.md
├── scripts/                # Shared build utilities
│   ├── build-lightweight.sh
│   ├── build-full.sh
│   └── version-config.js
├── Makefile               # Master build coordinator
└── README.md             # Multi-version documentation
```

## Lightweight Version Implementation

### WASM Wrapper Modifications (`src/wasm_wrapper_light.c`)

**Excluded Functions:**
- `wasm_deparse_protobuf()` - Protocol buffer deparse functionality
- `wasm_scan()` - SQL tokenization functionality  
- `wasm_parse_query_protobuf()` - Protocol buffer parsing
- `wasm_get_protobuf_len()` - Protocol buffer length calculation

**Retained Functions:**
- `wasm_parse_query()` - Core SQL parsing
- `wasm_parse_plpgsql()` - PL/pgSQL parsing
- `wasm_fingerprint()` - Query fingerprinting
- `wasm_normalize_query()` - Query normalization
- `wasm_parse_query_detailed()` - Detailed parsing with error info
- `wasm_free_detailed_result()` - Memory cleanup
- `wasm_free_string()` - String memory cleanup

### Makefile Configuration

**Lightweight Versions (PG13-16):**
```makefile
LIBPG_QUERY_TAG := 13-2.2.0  # Version-specific
SRC_FILES := src/wasm_wrapper_light.c

# Reduced WASM exports
-sEXPORTED_FUNCTIONS="['_malloc','_free','_wasm_parse_query','_wasm_parse_plpgsql','_wasm_fingerprint','_wasm_normalize_query','_wasm_parse_query_detailed','_wasm_free_detailed_result','_wasm_free_string']"
```

**Full Version (PG17):**
```makefile
LIBPG_QUERY_TAG := 17-6.1.0
SRC_FILES := src/wasm_wrapper.c

# Complete WASM exports
-sEXPORTED_FUNCTIONS="['_malloc','_free','_wasm_parse_query','_wasm_parse_query_protobuf','_wasm_get_protobuf_len','_wasm_deparse_protobuf','_wasm_parse_plpgsql','_wasm_fingerprint','_wasm_normalize_query','_wasm_scan','_wasm_parse_query_detailed','_wasm_free_detailed_result','_wasm_free_string']"
```

### JavaScript API Modifications (`wasm/index.js`)

**Lightweight API (PG13-16):**
```javascript
// Excluded imports
// import { pg_query } from '../proto.js';  // NO proto.js dependency

// Retained exports
export { parse, parseSync } from './core.js';
export { parsePlPgSQL, parsePlPgSQLSync } from './core.js';
export { fingerprint, fingerprintSync } from './core.js';
export { normalize, normalizeSync } from './core.js';
export { loadModule } from './core.js';

// Excluded exports (deparse/scan functionality)
// export { deparse, deparseSync } from './deparse.js';
// export { scan, scanSync } from './scan.js';
```

**Full API (PG17):**
```javascript
// Complete API including deparse/scan
export * from "@pgsql/types";
import { pg_query } from '../proto.js';

export { parse, parseSync } from './core.js';
export { deparse, deparseSync } from './deparse.js';
export { scan, scanSync } from './scan.js';
export { parsePlPgSQL, parsePlPgSQLSync } from './core.js';
export { fingerprint, fingerprintSync } from './core.js';
export { normalize, normalizeSync } from './core.js';
export { loadModule } from './core.js';
```

## libpg-query-multi Package Design

### Version Selector API (`libpg-query-multi/index.js`)

```javascript
// Named version exports
export { 
  parse as parse15, 
  fingerprint as fingerprint15,
  normalize as normalize15,
  parsePlPgSQL as parsePlPgSQL15
} from './pg15/index.js';

export { 
  parse as parse16, 
  fingerprint as fingerprint16,
  normalize as normalize16,
  parsePlPgSQL as parsePlPgSQL16
} from './pg16/index.js';

export { 
  parse as parse17, 
  fingerprint as fingerprint17,
  deparse as deparse17,
  scan as scan17,
  normalize as normalize17,
  parsePlPgSQL as parsePlPgSQL17
} from './pg17/index.js';

// Default to latest (PG17)
export { 
  parse, 
  fingerprint, 
  deparse, 
  scan, 
  normalize, 
  parsePlPgSQL 
} from './pg17/index.js';

### Type Generation Script for libpg-query-multi

**scripts/generate-types.js:**
```javascript
import { PgProtoParser, PgProtoParserOptions } from 'pg-proto-parser';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const versions = [
  { version: '15', tag: '15-4.2.4' },
  { version: '16', tag: '16-5.2.0' },
  { version: '17', tag: '17-6.1.0' }
];

async function generateTypes() {
  for (const { version, tag } of versions) {
    const protoUrl = `https://raw.githubusercontent.com/pganalyze/libpg_query/refs/tags/${tag}/protobuf/pg_query.proto`;
    const outDir = `./pg${version}/types`;
    
    // Ensure output directory exists
    mkdirSync(outDir, { recursive: true });
    
    // Fetch proto file
    const response = await fetch(protoUrl);
    const protoContent = await response.text();
    const protoFile = join(outDir, 'pg_query.proto');
    writeFileSync(protoFile, protoContent);
    
    // Configure pg-proto-parser
    const options = {
      outDir,
      types: {
        enabled: true,
        wrappedNodeTypeExport: true,
        optionalFields: true,
        filename: 'types.d.ts',
        enumsSource: './enums.js',
      },
      enums: {
        enabled: true,
        enumsAsTypeUnion: true,
        filename: 'enums.d.ts',
      },
    };
    
    // Generate types
    const parser = new PgProtoParser(protoFile, options);
    await parser.write();
    
    console.log(`Generated types for PostgreSQL ${version} (${tag})`);
  }
}

generateTypes().catch(console.error);
```



// Runtime version selector
export async function createParser(version) {
  switch(version) {
    case 15: return await import('./pg15/index.js');
    case 16: return await import('./pg16/index.js');
    case 17: return await import('./pg17/index.js');
    default: throw new Error(`Unsupported PostgreSQL version: ${version}`);
  }
}

// Version detection utility
export function getSupportedVersions() {
  return [15, 16, 17];
}

// Feature detection
export function getVersionFeatures(version) {
  const baseFeatures = ['parse', 'fingerprint', 'normalize', 'parsePlPgSQL'];
  const fullFeatures = [...baseFeatures, 'deparse', 'scan'];
  
  switch(version) {
    case 15:
    case 16: return baseFeatures;
    case 17: return fullFeatures;
    default: throw new Error(`Unknown version: ${version}`);
  }
}
```

### Package Configuration (`libpg-query-multi/package.json`)

```json
{
  "name": "libpg-query-multi",
  "version": "1.0.0",
  "description": "Multi-version PostgreSQL query parser (PG15/16/17)",
  "main": "./index.js",
  "types": "./index.d.ts",
  "exports": {
    ".": {
      "types": "./index.d.ts",
      "import": "./index.js",
      "require": "./index.cjs"
    },
    "./pg15": {
      "types": "./pg15/index.d.ts",
      "import": "./pg15/index.js",
      "require": "./pg15/index.cjs"
    },
    "./pg16": {
      "types": "./pg16/index.d.ts", 
      "import": "./pg16/index.js",
      "require": "./pg16/index.cjs"
    },
    "./pg17": {
      "types": "./pg17/index.d.ts",
      "import": "./pg17/index.js", 
      "require": "./pg17/index.cjs"
    }
  },
  "files": [
    "pg15/**/*",
    "pg16/**/*", 
    "pg17/**/*",
    "index.js",
    "index.d.ts",
    "index.cjs"
  ],
  "dependencies": {
    "@pgsql/types": "^17.0.0",
    "@launchql/protobufjs": "7.2.6"
  },
  "keywords": [
    "sql", "postgres", "postgresql", "pg", "query", 
    "multi-version", "pg15", "pg16", "pg17"
  ]
}
```

## Master Makefile System

### Root Makefile (`Makefile`)

```makefile
# Version configuration
VERSIONS := 13 14 15 16 17
LIGHTWEIGHT_VERSIONS := 13 14 15 16
FULL_VERSION := 17

# Directory configuration
LIGHTWEIGHT_DIRS := $(addprefix libpg-query-,$(LIGHTWEIGHT_VERSIONS))
FULL_DIR := libpg-query-full
MULTI_DIR := libpg-query-multi

# Docker configuration for consistent builds
EMSCRIPTEN_IMAGE := emscripten/emsdk:latest
DOCKER_RUN := docker run --rm -v $(PWD):/src -w /src -u $(shell id -u):$(shell id -g)

.PHONY: build-all build-lightweight build-full build-multi clean-all test-all publish-all

# Main targets
build-all: build-lightweight build-full build-multi

build-lightweight:
	@echo "Building lightweight versions (PG$(LIGHTWEIGHT_VERSIONS))..."
	@for dir in $(LIGHTWEIGHT_DIRS); do \
		echo "Building $$dir..."; \
		$(MAKE) -C $$dir build || exit 1; \
	done

build-full:
	@echo "Building full version (PG$(FULL_VERSION))..."
	$(MAKE) -C $(FULL_DIR) build

build-multi:
	@echo "Building multi-version package..."
	$(MAKE) -C $(MULTI_DIR) build

# Individual version targets
build-13: 
	$(MAKE) -C libpg-query-13 build

build-14:
	$(MAKE) -C libpg-query-14 build

build-15:
	$(MAKE) -C libpg-query-15 build

build-16:
	$(MAKE) -C libpg-query-16 build

build-17:
	$(MAKE) -C libpg-query-full build

# Testing
test-all:
	@for dir in $(LIGHTWEIGHT_DIRS) $(FULL_DIR) $(MULTI_DIR); do \
		echo "Testing $$dir..."; \
		$(MAKE) -C $$dir test || exit 1; \
	done

# Cleanup
clean-all:
	@for dir in $(LIGHTWEIGHT_DIRS) $(FULL_DIR) $(MULTI_DIR); do \
		echo "Cleaning $$dir..."; \
		$(MAKE) -C $$dir clean; \
	done

# Docker-based builds for consistency
docker-build-all:
	$(DOCKER_RUN) $(EMSCRIPTEN_IMAGE) make build-all

docker-test-all:
	$(DOCKER_RUN) $(EMSCRIPTEN_IMAGE) make test-all

# Publishing (requires npm authentication)
publish-all: build-all test-all
	@for dir in $(LIGHTWEIGHT_DIRS) $(FULL_DIR) $(MULTI_DIR); do \
		echo "Publishing $$dir..."; \
		cd $$dir && npm publish && cd ..; \
	done

# Development helpers
dev-setup:
	@echo "Setting up development environment..."
	@for dir in $(LIGHTWEIGHT_DIRS) $(FULL_DIR) $(MULTI_DIR); do \
		echo "Installing dependencies for $$dir..."; \
		cd $$dir && npm install && cd ..; \
	done

# Version bumping
bump-patch:
	@for dir in $(LIGHTWEIGHT_DIRS) $(FULL_DIR) $(MULTI_DIR); do \
		cd $$dir && npm version patch && cd ..; \
	done

bump-minor:
	@for dir in $(LIGHTWEIGHT_DIRS) $(FULL_DIR) $(MULTI_DIR); do \
		cd $$dir && npm version minor && cd ..; \
	done

bump-major:
	@for dir in $(LIGHTWEIGHT_DIRS) $(FULL_DIR) $(MULTI_DIR); do \
		cd $$dir && npm version major && cd ..; \
	done
```

## Version-Specific Configuration

### libpg_query Branch Mapping

| PostgreSQL Version | libpg_query Branch | Package Name | Features |
|-------------------|-------------------|--------------|----------|
| PG13 | `13-2.2.0` | `libpg-query-13` | parse, fingerprint, normalize, parsePlPgSQL |
| PG14 | `14-3.0.0` | `libpg-query-14` | parse, fingerprint, normalize, parsePlPgSQL |
| PG15 | `15-4.2.4` | `libpg-query-15` | parse, fingerprint, normalize, parsePlPgSQL |
| PG16 | `16-5.2.0` | `libpg-query-16` | parse, fingerprint, normalize, parsePlPgSQL |
| PG17 | `17-6.1.0` | `libpg-query-full` | parse, deparse, scan, fingerprint, normalize, parsePlPgSQL |

### Package Dependencies

```json
// libpg-query-13/package.json
{
  "name": "libpg-query-13",
  "version": "13.1.0",
  "dependencies": {
    "@pgsql/types": "^13.0.0"
  }
}

// libpg-query-14/package.json  
{
  "name": "libpg-query-14",
  "version": "14.1.0",
  "dependencies": {
    "@pgsql/types": "^14.0.0"
  }
}

// libpg-query-15/package.json
{
  "name": "libpg-query-15", 
  "version": "15.1.0",
  "dependencies": {
    "@pgsql/types": "^15.0.0"
  }
}

// libpg-query-16/package.json
{
  "name": "libpg-query-16",
  "version": "16.1.0", 
  "dependencies": {
    "@pgsql/types": "^16.0.0"
  }
}

// libpg-query-full/package.json
{
  "name": "libpg-query-full",
  "version": "17.2.0",
  "dependencies": {
    "@pgsql/types": "^17.0.0",
    "@launchql/protobufjs": "7.2.6"
  }
}
```

## Proto.js Exclusion Strategy

### Lightweight Versions (PG13-16)
- **No proto.js dependency** - excludes 5.4MB Protocol Buffer definitions
- **No protogen script** - skips Protocol Buffer generation step
- **Reduced package size** - significantly smaller WASM bundles
- **Build optimization** - faster builds without protobuf compilation

### Full Version (PG17) & Multi Package
- **Includes proto.js** - full Protocol Buffer support for deparse operations
- **Protogen integration** - generates proto.js from libpg_query definitions
- **Complete functionality** - supports all AST serialization operations

### Build Script Modifications

```makefile
# Lightweight version Makefile
protogen:
	@echo "Skipping protogen for lightweight version"

build: wasm-build
	@echo "Lightweight build complete (no proto.js)"

# Full version Makefile  
protogen:
	node scripts/protogen.js

build: protogen wasm-build
	@echo "Full build complete (with proto.js)"
```

## API Consistency Strategy

### Common API Surface
All versions provide consistent APIs for shared functionality:

```typescript
// Common interface across all versions
interface CommonParser {
  parse(query: string): Promise<ParseResult>;
  parseSync(query: string): ParseResult;
  parsePlPgSQL(funcsSql: string): Promise<ParseResult>;
  parsePlPgSQLSync(funcsSql: string): ParseResult;
  fingerprint(sql: string): Promise<string>;
  fingerprintSync(sql: string): string;
  normalize(sql: string): Promise<string>;
  normalizeSync(sql: string): string;
  loadModule(): Promise<void>;
}

// Extended interface for full version
interface FullParser extends CommonParser {
  deparse(parseTree: ParseResult): Promise<string>;
  deparseSync(parseTree: ParseResult): string;
  scan(sql: string): Promise<ScanResult>;
  scanSync(sql: string): ScanResult;
}
```

### Error Handling
Consistent error handling across versions:

```javascript
// Lightweight versions
export function deparse() {
  throw new Error('deparse() not available in lightweight version. Use libpg-query-full or libpg-query-multi for deparse functionality.');
}

export function scan() {
  throw new Error('scan() not available in lightweight version. Use libpg-query-full or libpg-query-multi for scan functionality.');
}
```

## Migration Guide

### From Current Single-Version Approach

**Before (current):**
```javascript
import { parse, deparse, scan } from 'libpg-query';
```

**After (version-specific):**
```javascript
// Option 1: Use specific version
import { parse } from 'libpg-query-15';  // Lightweight
import { parse, deparse, scan } from 'libpg-query-full';  // Full PG17

// Option 2: Use multi-version package with Parser class
import { Parser } from 'libpg-query-multi';

const parser = new Parser(); // Defaults to latest version (17)
const { tree } = await parser.parse('SELECT * FROM users WHERE id = 1');

// Or specify a version
const pg15Parser = new Parser({ version: 15 }); // Use Postgres 15 parser
const result = await pg15Parser.parse('SELECT * FROM users');

// Option 3: Default to latest
import { parse, deparse, scan } from 'libpg-query-multi';  // Uses PG17
```

### Package Selection Guide

| Use Case | Recommended Package | Rationale |
|----------|-------------------|-----------|
| Parse-only applications | `libpg-query-13/14/15/16` | Smallest bundle size |
| Full SQL manipulation | `libpg-query-full` | Complete PG17 functionality |
| Multi-version support | `libpg-query-multi` | Runtime version selection |
| Legacy PG compatibility | `libpg-query-15` | Stable PG15 support |
| Latest features | `libpg-query-full` | Cutting-edge PG17 |

## Testing Strategy

### Unit Testing
Each version maintains its own test suite:

```javascript
// libpg-query-13/test/parse.test.js
describe('PG13 Parser', () => {
  it('should parse basic SELECT', async () => {
    const result = await parse('SELECT * FROM users');
    expect(result.stmts).to.have.length(1);
  });
  
  it('should throw on deparse attempt', () => {
    expect(() => deparse({})).to.throw('deparse() not available');
  });
});

// libpg-query-full/test/deparse.test.js  
describe('PG17 Full Parser', () => {
  it('should deparse AST back to SQL', async () => {
    const ast = await parse('SELECT * FROM users');
    const sql = await deparse(ast);
    expect(sql).to.include('SELECT');
  });
});

// libpg-query-multi/test/version-selector.test.js
describe('Multi-Version Selector', () => {
  it('should load correct version', async () => {
    const pg15 = new Parser({ version: 15 });
    expect(await pg15.parse('SELECT 1')).to.have.property('tree');
    
    // Should throw error for unavailable functionality
    try {
      await pg15.deparse({});
      expect.fail('Should have thrown error');
    } catch (error) {
      expect(error.message).to.include('Deparse not available for PostgreSQL 15');
    }
  });
});
```

### Integration Testing
Cross-version compatibility testing:

```javascript
// test/integration/cross-version.test.js
describe('Cross-Version Compatibility', () => {
  it('should produce compatible ASTs', async () => {
    const sql = 'SELECT id, name FROM users WHERE active = true';
    
    const pg15Result = await pg15.parse(sql);
    const pg17Result = await pg17.parse(sql);
    
    // Core AST structure should be compatible
    expect(pg15Result.stmts[0].stmt_type).to.equal(pg17Result.stmts[0].stmt_type);
  });
});
```

### Performance Testing
Bundle size and runtime performance validation:

```javascript
// test/performance/bundle-size.test.js
describe('Bundle Size Validation', () => {
  it('lightweight versions should be under 2MB', () => {
    const lightweightSizes = [
      getPackageSize('libpg-query-13'),
      getPackageSize('libpg-query-14'), 
      getPackageSize('libpg-query-15'),
      getPackageSize('libpg-query-16')
    ];
    
    lightweightSizes.forEach(size => {
      expect(size).to.be.below(2 * 1024 * 1024); // 2MB
    });
  });
  
  it('full version should include proto.js overhead', () => {
    const fullSize = getPackageSize('libpg-query-full');
    expect(fullSize).to.be.above(5 * 1024 * 1024); // >5MB due to proto.js
  });
});
```

## Deployment Strategy

### NPM Publishing
Coordinated publishing across all packages:

```bash
# Build all versions
make build-all

# Test all versions  
make test-all

# Publish all packages
make publish-all
```

### Version Synchronization
Maintain consistent versioning across related packages:

```json
// scripts/sync-versions.js
{
  "libpg-query-13": "13.1.0",
  "libpg-query-14": "14.1.0", 
  "libpg-query-15": "15.1.0",
  "libpg-query-16": "16.1.0",
  "libpg-query-full": "17.2.0",
  "libpg-query-multi": "1.0.0"
}
```

### CI/CD Integration
GitHub Actions workflow for automated builds:

```yaml
# .github/workflows/multi-version-ci.yml
name: Multi-Version CI
on: [push, pull_request]

jobs:
  build-lightweight:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        version: [13, 14, 15, 16]
    steps:
      - uses: actions/checkout@v3
      - name: Build PG${{ matrix.version }}
        run: make build-${{ matrix.version }}
      - name: Test PG${{ matrix.version }}
        run: make -C libpg-query-${{ matrix.version }} test

  build-full:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Full Version
        run: make build-full
      - name: Test Full Version
        run: make -C libpg-query-full test

  build-multi:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Multi Package
        run: make build-multi
      - name: Test Multi Package
        run: make -C libpg-query-multi test
```

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)
1. Create folder structure
2. Implement lightweight WASM wrapper (`wasm_wrapper_light.c`)
3. Create master Makefile
4. Set up shared build scripts

### Phase 2: Lightweight Versions (Week 3-4)
1. Implement PG13-16 packages
2. Create lightweight JavaScript APIs
3. Configure version-specific Makefiles
4. Implement unit tests

### Phase 3: Full Version (Week 5)
1. Migrate current PG17 implementation to `libpg-query-full`
2. Ensure proto.js integration works
3. Validate deparse/scan functionality
4. Update documentation

### Phase 4: Multi-Version Package (Week 6)
1. Implement `libpg-query-multi` structure
2. Create version selector API
3. Build PG15/16/17 integration
4. Implement runtime version switching

### Phase 5: Testing & Documentation (Week 7-8)
1. Comprehensive testing across all versions
2. Performance validation
3. Bundle size optimization
4. Documentation completion
5. Migration guide creation

### Phase 6: Deployment (Week 9)
1. CI/CD pipeline setup
2. NPM package publishing
3. Version synchronization
4. Release coordination

## Risk Mitigation

### Compatibility Risks
- **AST Structure Changes**: Maintain compatibility matrices between versions
- **API Breaking Changes**: Use semantic versioning and deprecation warnings
- **Build Environment**: Use Docker for consistent build environments

### Maintenance Overhead
- **Shared Components**: Extract common build logic to shared scripts
- **Automated Testing**: Comprehensive CI/CD for all versions
- **Documentation**: Keep version-specific docs synchronized

### Performance Concerns
- **Bundle Size**: Monitor and optimize WASM bundle sizes
- **Runtime Overhead**: Benchmark version selection performance
- **Memory Usage**: Validate memory cleanup across versions

## Success Metrics

### Technical Metrics
- **Bundle Size Reduction**: Lightweight versions <2MB (vs current 7.4MB)
- **Build Time**: <5 minutes for all versions
- **Test Coverage**: >90% across all packages
- **API Compatibility**: 100% backward compatibility for shared functions

### User Experience Metrics
- **Migration Effort**: <1 hour for typical applications
- **Documentation Quality**: Complete API docs for all versions
- **Error Messages**: Clear guidance for missing functionality
- **Performance**: No regression in parse performance

## Conclusion

This multi-version architecture provides:

1. **Lightweight Options**: PG13-16 packages without deparse/scan overhead
2. **Full Functionality**: PG17 with complete feature set
3. **Flexible Integration**: Multi-version package for complex applications
4. **Maintainable Structure**: Folder-based organization with shared tooling
5. **Scalable Builds**: Master Makefile coordinating all versions

The approach balances functionality, performance, and maintainability while providing clear migration paths for existing users and optimal package selection for new projects.
