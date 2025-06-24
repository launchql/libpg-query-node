# @pgsql/parser

<p align="center" width="100%">
    <img src="https://github.com/launchql/libpg-query-node/assets/545047/5fd420cc-cdc6-4211-9b0f-0eca8321ba72" alt="hyperweb.io" width="100">
</p>

<p align="center" width="100%">
   <a href="https://github.com/launchql/libpg-query/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/libpg-query-node?filename=versions%2F17%2Fpackage.json"/></a><br />
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml/badge.svg" /></a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://img.shields.io/badge/macOS-available-333333?logo=apple&logoColor=white" /></a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://img.shields.io/badge/Windows-available-333333?logo=windows&logoColor=white" /></a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/ci.yml"><img height="20" src="https://img.shields.io/badge/Linux-available-333333?logo=linux&logoColor=white" /></a>
</p>

Multi-version PostgreSQL parser with dynamic version selection. This package provides a unified interface to parse PostgreSQL queries using different parser versions (15, 16, 17).

## Installation

```bash
npm install @pgsql/parser
```

## Usage

### Dynamic Version Selection

```javascript
import { parse, PgParser } from '@pgsql/parser';

// Parse with default version (17)
const result = await parse('SELECT 1+1 as sum');
console.log(result);
// { version: 17, result: { version: 170004, stmts: [...] } }

// Parse with specific version
const result15 = await parse('SELECT 1+1 as sum', 15);
console.log(result15);
// { version: 15, result: { version: 150007, stmts: [...] } }

// Using PgParser class
const parser = new PgParser(16);
const result16 = await parser.parse('SELECT * FROM users');
```

### Static Version Imports

For better tree-shaking and when you know which version you need:

```javascript
// Import specific version
import * as pg17 from '@pgsql/parser/v17';

await pg17.loadModule();
const result = await pg17.parse('SELECT 1');
console.log(result);
// { version: 170004, stmts: [...] }
```

### Error Handling

The parser returns errors in a consistent format:

```javascript
const result = await parse('INVALID SQL');
if (result.error) {
  console.error(result.error);
  // { type: 'syntax', message: 'syntax error at or near "INVALID"', position: 0 }
}
```

## API

### `parse(query: string, version?: 15 | 16 | 17): Promise<ParseResult>`

Parse a SQL query with the specified PostgreSQL version.

- `query`: The SQL query string to parse
- `version`: PostgreSQL version (15, 16, or 17). Defaults to 17.

Returns a promise that resolves to:
- On success: `{ version: number, result: AST }`
- On error: `{ version: number, error: { type: string, message: string, position: number } }`

### `PgParser`

Class for creating a parser instance with a specific version.

```javascript
const parser = new PgParser(version);
await parser.parse(query);
parser.parseSync(query); // Only available after first parse()
```

## Version Exports

- `@pgsql/parser/v15` - PostgreSQL 15 parser
- `@pgsql/parser/v16` - PostgreSQL 16 parser  
- `@pgsql/parser/v17` - PostgreSQL 17 parser

Each version export provides:
- `loadModule()`: Initialize the WASM module
- `parse(query)`: Parse a query (async)
- `parseSync(query)`: Parse a query (sync, requires loadModule first)

### Enum Output Format

Parsing with PostgreSQL 13 and 14 returns enum fields as **integers** in the
resulting AST JSON. From PG15 onward those fields contain the **string names** of
the enum values. When upgrading ASTs across versions you may need to convert
numeric enums from older parsers into strings.

## Credits

Built on the excellent work of several contributors:

* **[Dan Lynch](https://github.com/pyramation)** — official maintainer since 2018 and architect of the current implementation
* **[Lukas Fittl](https://github.com/lfittl)** for [libpg_query](https://github.com/pganalyze/libpg_query) — the core PostgreSQL parser that powers this project
* **[Greg Richardson](https://github.com/gregnr)** for AST guidance and pushing the transition to WASM and multiple PG runtimes for better interoperability
* **[Ethan Resnick](https://github.com/ethanresnick)** for the original Node.js N-API bindings
* **[Zac McCormick](https://github.com/zhm)** for the foundational [node-pg-query-native](https://github.com/zhm/node-pg-query-native) parser

## Related

* [pgsql-parser](https://www.npmjs.com/package/pgsql-parser): The real PostgreSQL parser for Node.js, providing symmetric parsing and deparsing of SQL statements with actual PostgreSQL parser integration.
* [pgsql-deparser](https://www.npmjs.com/package/pgsql-deparser): A streamlined tool designed for converting PostgreSQL ASTs back into SQL queries, focusing solely on deparser functionality to complement `pgsql-parser`.
* [@pgsql/parser](https://www.npmjs.com/package/@pgsql/parser): Multi-version PostgreSQL parser with dynamic version selection at runtime, supporting PostgreSQL 15, 16, and 17 in a single package.
* [@pgsql/types](https://www.npmjs.com/package/@pgsql/types): Offers TypeScript type definitions for PostgreSQL AST nodes, facilitating type-safe construction, analysis, and manipulation of ASTs.
* [@pgsql/enums](https://www.npmjs.com/package/@pgsql/enums): Provides TypeScript enum definitions for PostgreSQL constants, enabling type-safe usage of PostgreSQL enums and constants in your applications.
* [@pgsql/utils](https://www.npmjs.com/package/@pgsql/utils): A comprehensive utility library for PostgreSQL, offering type-safe AST node creation and enum value conversions, simplifying the construction and manipulation of PostgreSQL ASTs.
* [pg-proto-parser](https://www.npmjs.com/package/pg-proto-parser): A TypeScript tool that parses PostgreSQL Protocol Buffers definitions to generate TypeScript interfaces, utility functions, and JSON mappings for enums.
* [libpg-query](https://github.com/launchql/libpg-query-node): The real PostgreSQL parser exposed for Node.js, used primarily in `pgsql-parser` for parsing and deparsing SQL queries.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating Software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the Software code or Software CLI, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.