# libpg-query-full

PostgreSQL 17 query parser with complete functionality

## Features

- Parse SQL queries into AST
- Generate query fingerprints
- Normalize queries
- Parse PL/pgSQL functions
- Deparse AST back to SQL
- Scan queries for tokens

## Installation

```bash
npm install libpg-query-full
```

## Usage

```javascript
import { parse, deparse, scan, fingerprint, normalize } from 'libpg-query-full';

// Parse query
const ast = await parse('SELECT * FROM users');

// Deparse AST back to SQL
const sql = await deparse(ast);

// Scan query for tokens
const tokens = await scan('SELECT * FROM users');

// Generate fingerprint
const fp = await fingerprint('SELECT * FROM users WHERE id = $1');

// Normalize query
const normalized = await normalize('SELECT * FROM users WHERE id = 123');
```

## Complete Functionality

This package includes all PostgreSQL 17 features:
- Full parsing capabilities
- Deparse functionality
- Token scanning
- Query fingerprinting
- Query normalization
