# libpg-query

<p align="center" width="100%">
    <img src="https://github.com/launchql/libpg-query-node/assets/545047/5fd420cc-cdc6-4211-9b0f-0eca8321ba72" alt="webincubator" width="100">
</p>

<p align="center" width="100%">
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/npm/dt/libpg-query"></a>
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/npm/dw/libpg-query"/></a>
   <a href="https://github.com/launchql/libpg-query/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/libpg-query-node?filename=libpg-query%2Fpackage.json"/></a><br />
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml/badge.svg" /></a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://img.shields.io/badge/macOS-available-333333?logo=apple&logoColor=white" /></a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://img.shields.io/badge/Windows-available-333333?logo=windows&logoColor=white" /></a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://img.shields.io/badge/Linux-available-333333?logo=linux&logoColor=white" /></a>
</p>

The real PostgreSQL parser for Node.js, powered by **WebAssembly (WASM)** for true cross-platform compatibility.

A WASM-based PostgreSQL query parser that provides the same functionality as the native PostgreSQL parser without requiring native compilation or platform-specific binaries. Primarily used for the node.js parser and deparser [pgsql-parser](https://github.com/pyramation/pgsql-parser).


## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Build Instructions](#build-instructions)
4. [Testing](#testing)
5. [Versions](#versions)
6. [Related Projects](#related-projects)
7. [Credit](#credit)


## Installation

```sh
npm install libpg-query@pg15
```

## Usage

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
