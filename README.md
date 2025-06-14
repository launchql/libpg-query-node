# libpg-query

<p align="center" width="100%">
    <img src="https://github.com/launchql/libpg-query-node/assets/545047/5fd420cc-cdc6-4211-9b0f-0eca8321ba72" alt="webincubator" width="100">
</p>

<p align="center" width="100%">
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/npm/dt/libpg-query"></a>
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/npm/dw/libpg-query"/></a>
   <a href="https://github.com/launchql/libpg-query/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/libpg-query-node"/></a><br />
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml/badge.svg" />
   </a><br />
   [![macOS](https://img.shields.io/badge/macOS-available-333333?logo=apple&logoColor=white)](https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml)
   [![Windows](https://img.shields.io/badge/Windows-available-333333?logo=windows&logoColor=white)](https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml)
   [![Linux](https://img.shields.io/badge/Linux-available-333333?logo=linux&logoColor=white)](https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml)
</p>

The real PostgreSQL parser for Node.js, powered by **WebAssembly (WASM)** for true cross-platform compatibility.

A WASM-based PostgreSQL query parser that provides the same functionality as the native PostgreSQL parser without requiring native compilation or platform-specific binaries. Primarily used for the node.js parser and deparser [pgsql-parser](https://github.com/pyramation/pgsql-parser).


## Table of Contents

1. [Installation](#installation)
2. [Example](#example)
3. [Build Instructions](#build-instructions)
4. [Testing](#testing)
5. [Documentation](#documentation)
6. [Versions](#versions)
7. [Related Projects](#related-projects)
8. [Credit](#credit)


## Installation

```sh
npm install libpg-query
```

## Example

```typescript
import { parseQuery, parseQuerySync } from 'libpg-query';

// Async usage (recommended)
const result = await parseQuery('SELECT * FROM users WHERE id = $1');
console.log(result);

// Sync usage
const syncResult = parseQuerySync('SELECT * FROM users WHERE id = $1');
console.log(syncResult);
```

### CommonJS Usage

```javascript
const { parseQuery, parseQuerySync } = require('libpg-query');

parseQuery('SELECT * FROM users WHERE id = $1').then(console.log);
```

## Build Instructions

This package uses a **WASM-only build system** for true cross-platform compatibility without native compilation dependencies.

### Prerequisites

- Node.js (version 16 or higher recommended)
- Docker (for WASM compilation using Emscripten)
- yarn or npm

### Building WASM Artifacts

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Build WASM artifacts:**
   ```bash
   npm run wasm:build
   # or
   yarn wasm:build
   ```

3. **Clean WASM build (if needed):**
   ```bash
   npm run wasm:clean
   # or
   yarn wasm:clean
   ```

4. **Rebuild WASM artifacts from scratch:**
   ```bash
   npm run wasm:clean && npm run wasm:build
   # or
   yarn wasm:clean && yarn wasm:build
   ```

### Build Process Details

The WASM build process:
- Uses Docker with Emscripten SDK for compilation
- Compiles C wrapper code to WebAssembly
- Generates `wasm/libpg-query.js` and `wasm/libpg-query.wasm` files
- No native compilation or node-gyp dependencies required

## Testing

### Running Tests

```bash
npm test
# or
yarn test
```

### Test Requirements

- WASM artifacts must be built before running tests
- If tests fail with "fetch failed" errors, rebuild WASM artifacts:
  ```bash
  npm run wasm:clean && npm run wasm:build && npm test
  ```

### Expected Test Output

All tests should pass:
```
  Queries
    Sync Parsing
      ✓ should return a single-item parse result for common queries
      ✓ should support parsing multiple queries
      ✓ should not parse a bogus query
    Async parsing
      ✓ should return a promise resolving to same result
      ✓ should reject on bogus queries
    Deparsing
      ✓ async function should return a promise resolving to same SQL
      ✓ sync function should return a same SQL
      [... more tests ...]

  18 passing (70ms)
```

## Documentation

### `parseQuery(sql: string): Promise<ParseResult[]>`

Parses the SQL and returns a Promise for the parse tree. May reject with a parse error.

```typescript
import { parseQuery } from 'libpg-query';

const result = await parseQuery('SELECT * FROM users WHERE active = true');
// Returns: ParseResult[] - array of parsed query objects
```

### `parseQuerySync(sql: string): ParseResult[]`

Synchronous version that returns the parse tree directly. May throw a parse error.

```typescript
import { parseQuerySync } from 'libpg-query';

const result = parseQuerySync('SELECT * FROM users WHERE active = true');
// Returns: ParseResult[] - array of parsed query objects
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
```

**Note:** The return value is an array, as multiple queries may be provided in a single string (semicolon-delimited, as PostgreSQL expects).

## Versions

Our latest is built with `17-latest` branch from libpg_query


| PG Major Version | libpg_query | Branch                                                                                         | npm 
|--------------------------|-------------|------------------------------------------------------------------------------------------------|---------|
| 17                       | 17-latest   | [`17-latest`](https://github.com/launchql/libpg-query-node/tree/17-latest)                       | [`libpg-query@17.1.1`](https://www.npmjs.com/package/libpg-query/v/latest)
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

**Docker permission errors:**
- Ensure Docker is running and accessible
- On Linux, you may need to add your user to the docker group

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
