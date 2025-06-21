# libpg-query-multi

Multi-version PostgreSQL query parser with runtime version selection

## Features

- Runtime PostgreSQL version selection (15, 16, 17)
- Parser class API for flexible usage
- Named exports for direct version access
- Automatic feature availability detection

## Installation

```bash
npm install libpg-query-multi
```

## Usage

### Parser Class API

```javascript
import { Parser } from 'libpg-query-multi';

// Default to latest (PostgreSQL 17)
const parser = new Parser();
const result = await parser.parse('SELECT * FROM users');

// Specify PostgreSQL version
const pg15Parser = new Parser({ version: 15 });
const result15 = await pg15Parser.parse('SELECT * FROM users');

// Feature availability is automatically handled
try {
  await pg15Parser.deparse(result15); // Throws error - not available in PG15
} catch (error) {
  console.log(error.message); // "Deparse functionality not available for PostgreSQL 15"
}

// PG17 has all features
const pg17Parser = new Parser({ version: 17 });
const ast = await pg17Parser.parse('SELECT * FROM users');
const sql = await pg17Parser.deparse(ast);
const tokens = await pg17Parser.scan('SELECT * FROM users');
```

### Named Exports

```javascript
import { 
  parse15, parse16, parse17,
  deparse16, deparse17,
  scan17,
  parse, deparse, scan // Defaults to PG17
} from 'libpg-query-multi';

// Direct version access
const result15 = await parse15('SELECT * FROM users');
const result16 = await parse16('SELECT * FROM users');
const result17 = await parse17('SELECT * FROM users');

// Deparse (available in PG16+)
const sql16 = await deparse16(result16);
const sql17 = await deparse17(result17);

// Scan (available in PG17 only)
const tokens = await scan17('SELECT * FROM users');

// Default exports (PG17)
const ast = await parse('SELECT * FROM users');
const sql = await deparse(ast);
const scanResult = await scan('SELECT * FROM users');
```

## Feature Matrix

| Feature | PG15 | PG16 | PG17 |
|---------|------|------|------|
| Parse | ✅ | ✅ | ✅ |
| Fingerprint | ✅ | ✅ | ✅ |
| Normalize | ✅ | ✅ | ✅ |
| PL/pgSQL | ✅ | ✅ | ✅ |
| Deparse | ❌ | ✅ | ✅ |
| Scan | ❌ | ❌ | ✅ |

## Error Handling

The Parser class automatically detects feature availability and provides helpful error messages:

```javascript
const pg15Parser = new Parser({ version: 15 });

try {
  await pg15Parser.scan('SELECT 1');
} catch (error) {
  console.log(error.message);
  // "Scan functionality not available for PostgreSQL 15. Available in version 17 only."
}
```
