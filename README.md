# libpg-query-node

<p align="center" width="100%">
    <img src="https://github.com/launchql/libpg-query-node/assets/545047/5fd420cc-cdc6-4211-9b0f-0eca8321ba72" alt="webincubator" width="100">
</p>

<p align="center" width="100%">
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/npm/dt/libpg-query"></a>
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/npm/dw/libpg-query"/></a>
   <a href="https://github.com/launchql/libpg-query/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/libpg-query-node"/></a><br />
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml/badge.svg" /></a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://img.shields.io/badge/macOS-available-333333?logo=apple&logoColor=white" /></a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://img.shields.io/badge/Windows-available-333333?logo=windows&logoColor=white" /></a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://img.shields.io/badge/Linux-available-333333?logo=linux&logoColor=white" /></a>
</p>

The real PostgreSQL parser for Node.js, powered by **WebAssembly (WASM)** for true cross-platform compatibility.

This repository provides two distinct packages:

- **pg17-full**: Complete PostgreSQL parser with all functionality including scan, deparse, and protobuf support
- **pg17**: Minimal PostgreSQL parser focused on core parsing, fingerprinting, and normalization (excludes scan/deparse functionality)

Both packages are WASM-based PostgreSQL query parsers that provide the same core functionality as the native PostgreSQL parser without requiring native compilation or platform-specific binaries.


## Table of Contents

1. [Package Structure](#package-structure)
2. [Installation](#installation)
3. [Building Both Packages](#building-both-packages)
4. [Usage](#usage)
5. [Build Instructions](#build-instructions)
6. [Testing](#testing)
7. [Versions](#versions)
8. [Related Projects](#related-projects)
9. [Credit](#credit)

## Package Structure

This repository contains two packages:

### pg17-full (Complete Package)
- Full PostgreSQL parsing functionality
- Includes scan, deparse, and protobuf support
- Larger package size due to complete feature set
- Located in `./pg17-full/`

### pg17 (Minimal Package)  
- Core PostgreSQL parsing functionality
- Excludes scan, deparse, and protobuf features
- Smaller package size optimized for basic parsing needs
- Located in `./pg17/`

## Installation

Choose the package that best fits your needs:

**For full functionality:**
```bash
cd pg17-full
npm install
```

**For minimal parsing:**
```bash
cd pg17
npm install
```

## Building Both Packages

Use the package management Makefile to build both packages:

```bash
# Install dependencies for both packages
make -f Makefile.packages install

# Build both packages
make -f Makefile.packages build

# Clean both packages
make -f Makefile.packages clean

# Test both packages
make -f Makefile.packages test
```

## Usage

### Basic Examples

**pg17-full (Complete Package):**
```typescript
import { parse, deparse, scan } from './pg17-full/src/index.js';

const result = await parse('SELECT * FROM users WHERE active = true');
const sql = await deparse(result);
const tokens = await scan('SELECT * FROM users');
console.log(JSON.stringify(result, null, 2));
```

**pg17 (Minimal Package):**
```typescript
import { parse, fingerprint, normalize } from './pg17/src/index.js';

const result = await parse('SELECT * FROM users WHERE active = true');
const fp = await fingerprint('SELECT * FROM users');
const norm = await normalize('SELECT * FROM users');
console.log(JSON.stringify(result, null, 2));
```

### `parse(query: string): Promise<ParseResult>`

Parses the SQL and returns a Promise for the parse tree. May reject with a parse error.

```typescript
import { parse } from 'libpg-query';

const result = await parse('SELECT * FROM users WHERE active = true');
// Returns: ParseResult - parsed query object
```

### `parseSync(query: string): ParseResult`

Synchronous version that returns the parse tree directly. May throw a parse error.

```typescript
import { parseSync } from 'libpg-query';

const result = parseSync('SELECT * FROM users WHERE active = true');
// Returns: ParseResult - parsed query object
```

### `parsePlPgSQL(funcsSql: string): Promise<ParseResult>`

Parses the contents of a PL/pgSQL function from a `CREATE FUNCTION` declaration. Returns a Promise for the parse tree.

```typescript
import { parsePlPgSQL } from 'libpg-query';

const functionSql = `
CREATE FUNCTION get_user_count() RETURNS integer AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM users);
END;
$$ LANGUAGE plpgsql;
`;

const result = await parsePlPgSQL(functionSql);
```

### `parsePlPgSQLSync(funcsSql: string): ParseResult`

Synchronous version of PL/pgSQL parsing.

```typescript
import { parsePlPgSQLSync } from 'libpg-query';

const result = parsePlPgSQLSync(functionSql);
```

### `deparse(parseTree: ParseResult): Promise<string>`

Converts a parse tree back to SQL string. Returns a Promise for the SQL string.

```typescript
import { parse, deparse } from 'libpg-query';

const parseTree = await parse('SELECT * FROM users WHERE active = true');
const sql = await deparse(parseTree);
// Returns: string - reconstructed SQL query
```

### `deparseSync(parseTree: ParseResult): string`

Synchronous version that converts a parse tree back to SQL string directly.

```typescript
import { parseSync, deparseSync } from 'libpg-query';

const parseTree = parseSync('SELECT * FROM users WHERE active = true');
const sql = deparseSync(parseTree);
// Returns: string - reconstructed SQL query
```

### `fingerprint(sql: string): Promise<string>`

Generates a unique fingerprint for a SQL query that can be used for query identification and caching. Returns a Promise for a 16-character fingerprint string.

```typescript
import { fingerprint } from 'libpg-query';

const fp = await fingerprint('SELECT * FROM users WHERE active = $1');
// Returns: string - unique 16-character fingerprint (e.g., "50fde20626009aba")
```

### `fingerprintSync(sql: string): string`

Synchronous version that generates a unique fingerprint for a SQL query directly.

```typescript
import { fingerprintSync } from 'libpg-query';

const fp = fingerprintSync('SELECT * FROM users WHERE active = $1');
// Returns: string - unique 16-character fingerprint
```

### `normalize(sql: string): Promise<string>`

Normalizes a SQL query by removing comments, standardizing whitespace, and converting to a canonical form. Returns a Promise for the normalized SQL string.

```typescript
import { normalize } from 'libpg-query';

const normalized = await normalize('SELECT * FROM users WHERE active = true');
// Returns: string - normalized SQL query
```

### `normalizeSync(sql: string): string`

Synchronous version that normalizes a SQL query directly.

```typescript
import { normalizeSync } from 'libpg-query';

const normalized = normalizeSync('SELECT * FROM users WHERE active = true');
// Returns: string - normalized SQL query
```

### `scan(sql: string): Promise<ScanResult>`

Scans (tokenizes) a SQL query and returns detailed information about each token. Returns a Promise for a ScanResult containing all tokens with their positions, types, and classifications.

```typescript
import { scan } from 'libpg-query';

const result = await scan('SELECT * FROM users WHERE id = $1');
// Returns: ScanResult - detailed tokenization information
console.log(result.tokens[0]); // { start: 0, end: 6, text: "SELECT", tokenType: 651, tokenName: "UNKNOWN", keywordKind: 4, keywordName: "RESERVED_KEYWORD" }
```

### `scanSync(sql: string): ScanResult`

Synchronous version that scans (tokenizes) a SQL query directly.

```typescript
import { scanSync } from 'libpg-query';

const result = scanSync('SELECT * FROM users WHERE id = $1');
// Returns: ScanResult - detailed tokenization information
```

### Initialization

The library provides both async and sync methods. Async methods handle initialization automatically, while sync methods require explicit initialization.

#### Async Methods (Recommended)

Async methods handle initialization automatically and are always safe to use:

```typescript
import { parse, deparse, scan } from 'libpg-query';

// These handle initialization automatically
const result = await parse('SELECT * FROM users');
const sql = await deparse(result);
const tokens = await scan('SELECT * FROM users');
```

#### Sync Methods

Sync methods require explicit initialization using `loadModule()`:

```typescript
import { loadModule, parseSync, scanSync } from 'libpg-query';

// Initialize first
await loadModule();

// Now safe to use sync methods
const result = parseSync('SELECT * FROM users');
const tokens = scanSync('SELECT * FROM users');
```

### `loadModule(): Promise<void>`

Explicitly initializes the WASM module. Required before using any sync methods.

```typescript
import { loadModule, parseSync, scanSync } from 'libpg-query';

// Initialize before using sync methods
await loadModule();
const result = parseSync('SELECT * FROM users');
const tokens = scanSync('SELECT * FROM users');
```

Note: We recommend using async methods as they handle initialization automatically. Use sync methods only when necessary, and always call `loadModule()` first.

### Type Definitions

```typescript
interface ParseResult {
  version: number;
  stmts: Statement[];
}

interface Statement {
  stmt_type: string;
  stmt_len: number;
  stmt_location: number;
  query: string;
}

interface ScanResult {
  version: number;
  tokens: ScanToken[];
}

interface ScanToken {
  start: number;          // Starting position in the SQL string
  end: number;            // Ending position in the SQL string
  text: string;           // The actual token text
  tokenType: number;      // Numeric token type identifier
  tokenName: string;      // Human-readable token type name
  keywordKind: number;    // Numeric keyword classification
  keywordName: string;    // Human-readable keyword classification
}
```

**Note:** The return value is an array, as multiple queries may be provided in a single string (semicolon-delimited, as PostgreSQL expects).

## Build Instructions

This package uses a **WASM-only build system** for true cross-platform compatibility without native compilation dependencies.

### Prerequisites

- Node.js (version 16 or higher recommended)

### Building WASM Artifacts

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build WASM artifacts:**
   ```bash
   npm run wasm:build
   ```

3. **Clean WASM build (if needed):**
   ```bash
   npm run wasm:clean
   ```

4. **Rebuild WASM artifacts from scratch:**
   ```bash
   npm run wasm:clean && npm run wasm:build
   ```

### Build Process Details

The WASM build process:
- Uses Emscripten SDK for compilation
- Compiles C wrapper code to WebAssembly
- Generates `wasm/libpg-query.js` and `wasm/libpg-query.wasm` files
- No native compilation or node-gyp dependencies required

## Testing

### Running Tests

```bash
npm test
```

### Test Requirements

- WASM artifacts must be built before running tests
- If tests fail with "fetch failed" errors, rebuild WASM artifacts:
  ```bash
  npm run wasm:clean && npm run wasm:build && npm test
  ```



## Versions

Our latest is built with `17-latest` branch from libpg_query


| PG Major Version | libpg_query | Branch                                                                                         | npm 
|--------------------------|-------------|------------------------------------------------------------------------------------------------|---------|
| 17                       | 17-latest   | [`17-latest`](https://github.com/launchql/libpg-query-node/tree/17-latest)                       | [`libpg-query@17.2.0`](https://www.npmjs.com/package/libpg-query/v/latest)
| 16                       | 16-latest   | [`16-latest`](https://github.com/launchql/libpg-query-node/tree/16-latest)                       | [`libpg-query@16.2.0`](https://www.npmjs.com/package/libpg-query/v/16.2.0)
| 15                       | 15-latest   | [`15-latest`](https://github.com/launchql/libpg-query-node/tree/15-latest)                       | [`libpg-query@15.1.0`](https://www.npmjs.com/package/libpg-query/v/15.1.0)
| 14                       | 14-latest   | [`14-latest`](https://github.com/launchql/libpg-query-node/tree/14-latest)                       | [`libpg-query@14.0.0`](https://www.npmjs.com/package/libpg-query/v/14.0.0)
| 13                       | 13-latest   | [`13-latest`](https://github.com/launchql/libpg-query-node/tree/13-latest)                       | [`libpg-query@13.3.1`](https://www.npmjs.com/package/libpg-query/v/13.3.1)
| 12                       | (n/a)       |                                                                                                |
| 11                       | (n/a)       |                                                                                                |
| 10                       | 10-latest   |                        | `@1.3.1` ([tree](https://github.com/pyramation/pgsql-parser/tree/39b7b1adc8914253226e286a48105785219a81ca))      |


## Troubleshooting

### Common Issues

**"fetch failed" errors during tests:**
- This indicates stale or missing WASM artifacts
- Solution: `npm run wasm:clean && npm run wasm:build`

**"WASM module not initialized" errors:**
- Ensure you call an async method first to initialize the WASM module
- Or use the async versions of methods which handle initialization automatically

**Build environment issues:**
- Ensure Emscripten SDK is properly installed and configured
- Check that all required build dependencies are available

### Build Artifacts

The build process generates these files:
- `wasm/libpg-query.js` - Emscripten-generated JavaScript loader
- `wasm/libpg-query.wasm` - WebAssembly binary
- `wasm/index.js` - ES module exports
- `wasm/index.cjs` - CommonJS exports with sync wrappers

## Related Projects

* [libpg_query](https://github.com/pganalyze/libpg_query)
* [pgsql-parser](https://github.com/pyramation/pgsql-parser)
* [pg_query](https://github.com/lfittl/pg_query)
* [pg_query.go](https://github.com/lfittl/pg_query.go)

## Credit

This is based on the output of [libpg_query](https://github.com/pganalyze/libpg_query). This wraps the static library output and links it into a node module for use in js.

All credit for the hard problems goes to [Lukas Fittl](https://github.com/lfittl).

Additional thanks for the original Node.js integration work by [Ethan Resnick](https://github.com/ethanresnick).

Original [Code](https://github.com/zhm/node-pg-query-native) and [License](https://github.com/zhm/node-pg-query-native/blob/master/LICENSE.md)
