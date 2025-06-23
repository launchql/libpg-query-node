# libpg-query

<p align="center" width="100%">
    <img src="https://github.com/launchql/libpg-query-node/assets/545047/5fd420cc-cdc6-4211-9b0f-0eca8321ba72" alt="webincubator" width="100">
</p>

<p align="center" width="100%">
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/npm/dt/libpg-query"></a>
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/npm/dw/libpg-query"/></a>
   <a href="https://github.com/launchql/libpg-query/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/libpg-query-node?filename=versions%2F17%2Fpackage.json"/></a><br />
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml/badge.svg" /></a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://img.shields.io/badge/macOS-available-333333?logo=apple&logoColor=white" /></a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://img.shields.io/badge/Windows-available-333333?logo=windows&logoColor=white" /></a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://img.shields.io/badge/Linux-available-333333?logo=linux&logoColor=white" /></a>
</p>

# The Real PostgreSQL Parser for JavaScript

### Bring the power of PostgreSQL’s native parser to your JavaScript projects — no native builds, no platform headaches.

This is the official PostgreSQL parser, compiled to WebAssembly (WASM) for seamless, cross-platform compatibility. Use it in Node.js or the browser, on Linux, Windows, or anywhere JavaScript runs.

Built to power [pgsql-parser](https://github.com/pyramation/pgsql-parser), this library delivers full fidelity with the Postgres C codebase — no rewrites, no shortcuts.

## Features

* 🔧 **Powered by PostgreSQL** – Uses the official Postgres C parser compiled to WebAssembly
* 🖥️ **Cross-Platform** – Runs smoothly on macOS, Linux, and Windows
* 🌐 **Node.js & Browser Support** – Consistent behavior in any JS environment
* 📦 **No Native Builds Required** – No compilation, no system-specific dependencies
* 🧠 **Spec-Accurate Parsing** – Produces faithful, standards-compliant ASTs
* 🚀 **Production-Grade** – Millions of downloads powering 1000s of projects

## 🚀 For Round-trip Codegen

> 🎯 **Want to parse + deparse (full round trip)?**  
> We highly recommend using [`pgsql-parser`](https://github.com/launchql/pgsql-parser) which leverages a pure TypeScript deparser that has been battle-tested against 23,000+ SQL statements and is built on top of libpg-query.

## Installation

```sh
npm install libpg-query
```

## Example

```typescript
import { parse } from 'libpg-query';

const result = await parse('SELECT * FROM users WHERE active = true');
// {"version":170004,"stmts":[{"stmt":{"SelectStmt":{"targetList":[{"ResTarget" ... "op":"SETOP_NONE"}}}]}
```

## 📦 Packages

This repository contains multiple packages to support different PostgreSQL versions and use cases:

### Available Packages & Versions

| Package | Description | PostgreSQL Versions | npm Package |
|---------|-------------|---------------------|-------------|
| **[libpg-query](https://github.com/launchql/libpg-query-node/tree/main/versions)** | Lightweight parser (parse only) | 13, 14, 15, 16, 17 | [`libpg-query`](https://www.npmjs.com/package/libpg-query) |
| **[@pgsql/types](https://github.com/launchql/libpg-query-node/tree/main/types)** | TypeScript type definitions | 13, 14, 15, 16, 17 | [`@pgsql/types`](https://www.npmjs.com/package/@pgsql/types) |
| **[@pgsql/enums](https://github.com/launchql/libpg-query-node/tree/main/enums)** | TypeScript enum definitions | 13, 14, 15, 16, 17 | [`@pgsql/enums`](https://www.npmjs.com/package/@pgsql/enums) |
| **[@libpg-query/parser](https://github.com/launchql/libpg-query-node/tree/main/full)** | Full parser with all features | 17 only | [`@libpg-query/parser`](https://www.npmjs.com/package/@libpg-query/parser) |

### Version Tags

Each versioned package uses npm dist-tags for PostgreSQL version selection:

```bash
# Install specific PostgreSQL version
npm install libpg-query@pg17      # PostgreSQL 17 (latest)
npm install libpg-query@pg16      # PostgreSQL 16
npm install @pgsql/types@pg17     # Types for PostgreSQL 17
npm install @pgsql/enums@pg15     # Enums for PostgreSQL 15

# Install latest (defaults to pg17)
npm install libpg-query
npm install @pgsql/types
npm install @pgsql/enums
```

### Which Package Should I Use?

- **Just need to parse SQL?** → Use `libpg-query` (lightweight, all PG versions)
- **Need TypeScript types?** → Add `@pgsql/types` and/or `@pgsql/enums`
- **Need fingerprint, normalize, or deparse?** → Use `@libpg-query/parser` (PG 17 only)


## API Documentation

For detailed API documentation and usage examples, see the package-specific READMEs:

- **libpg-query** - [Parser API Documentation](https://github.com/launchql/libpg-query-node/tree/main/versions/17)
- **@pgsql/types** - [Types Documentation](https://github.com/launchql/libpg-query-node/tree/main/types/17)
- **@pgsql/enums** - [Enums Documentation](https://github.com/launchql/libpg-query-node/tree/main/enums/17)
- **@libpg-query/parser** - [Full Parser Documentation](https://github.com/launchql/libpg-query-node/tree/main/full)

## Build Instructions

This package uses a **WASM-only build system** for true cross-platform compatibility without native compilation dependencies.

### Prerequisites

- Node.js (version 16 or higher recommended)
- [pnpm](https://pnpm.io/) (v8+ recommended)

### Building WASM Artifacts

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build WASM artifacts:**
   ```bash
   pnpm run build
   ```

3. **Clean WASM build (if needed):**
   ```bash
   pnpm run clean
   ```

4. **Rebuild WASM artifacts from scratch:**
   ```bash
   pnpm run clean && pnpm run build
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
pnpm run test
```

### Test Requirements

- WASM artifacts must be built before running tests
- If tests fail with "fetch failed" errors, rebuild WASM artifacts:
  ```bash
  pnpm run clean && pnpm run build && pnpm run test
  ```

## Troubleshooting

### Common Issues

**"fetch failed" errors during tests:**
- This indicates stale or missing WASM artifacts
- Solution: `pnpm run clean && pnpm run build`

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

* This is based on the output of [libpg_query](https://github.com/pganalyze/libpg_query). This wraps the static library output and links it into a node module for use in js.

* All credit for the hard problems goes to [Lukas Fittl](https://github.com/lfittl).

* Additional thanks for the original Node.js integration work by [Ethan Resnick](https://github.com/ethanresnick).

* Original [Code](https://github.com/zhm/node-pg-query-native) and [License](https://github.com/zhm/node-pg-query-native/blob/master/LICENSE.md)

## Related

* [pgsql-parser](https://github.com/launchql/pgsql-parser): The real PostgreSQL parser for Node.js, providing symmetric parsing and deparsing of SQL statements with actual PostgreSQL parser integration.
* [pgsql-deparser](https://github.com/launchql/pgsql-parser/tree/main/packages/deparser): A streamlined tool designed for converting PostgreSQL ASTs back into SQL queries, focusing solely on deparser functionality to complement `pgsql-parser`.
* [@pgsql/types](https://github.com/launchql/pgsql-parser/tree/main/packages/types): Offers TypeScript type definitions for PostgreSQL AST nodes, facilitating type-safe construction, analysis, and manipulation of ASTs.
* [@pgsql/utils](https://github.com/launchql/pgsql-parser/tree/main/packages/utils): A comprehensive utility library for PostgreSQL, offering type-safe AST node creation and enum value conversions, simplifying the construction and manipulation of PostgreSQL ASTs.
* [pg-proto-parser](https://github.com/launchql/pg-proto-parser): A TypeScript tool that parses PostgreSQL Protocol Buffers definitions to generate TypeScript interfaces, utility functions, and JSON mappings for enums.
* [libpg-query](https://github.com/launchql/libpg-query-node): The real PostgreSQL parser exposed for Node.js, used primarily in `pgsql-parser` for parsing and deparsing SQL queries.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating Software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the Software code or Software CLI, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.