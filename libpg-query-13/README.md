# libpg-query-13

PostgreSQL 13 query parser (lightweight version)

## Features

- Parse SQL queries into AST
- Generate query fingerprints
- Normalize queries
- Parse PL/pgSQL functions

## Installation

```bash
npm install libpg-query-13
```

## Usage

```javascript
import { parse, fingerprint, normalize } from 'libpg-query-13';

const ast = await parse('SELECT * FROM users');
const fp = await fingerprint('SELECT * FROM users WHERE id = $1');
const normalized = await normalize('SELECT * FROM users WHERE id = 123');
```

## Limitations

This is a lightweight version that does not include:
- Deparse functionality
- Scan functionality

For full functionality, use `libpg-query-full` or `libpg-query-multi`.
