# pg-plgpsql-query-native

The real PostgreSQL parser for nodejs.

This is based on the output of [libpg_query](https://github.com/lfittl/libpg_query). This wraps the static library output and links it into a node module for use in js.

All credit for the hard problems goes to [Lukas Fittl](https://github.com/lfittl).

## Requirements

Instal node-gyp globally

```sh
npm install node-gyp -g
```

## Installation

```sh
npm install pg-plpgsql-query-native
```

### Documentation

### `query.parseQuery(query)`/`parseQuerySync`

Parses the query and returns a Promise for the parse tree (or returns the parse tree directly in the sync version). May reject with/throw a parse error.

The return value is an array, as multiple queries may be provided in a single string (semicolon-delimited, as Postgres expects).

### `query.parsePlPgSQL(func)`/`query.parsePlPgSQLSync(func)`

Parses the contents of a PL/PGSql function, from a `CREATE FUNCTION` declaration, and returns a Promise for the parse tree (or returns the parse tree directly in the sync version). May reject with/throw a parse error.

## Example

```js
var parse = require('pg-query-native').parseQuery;
parse('select 1').then(console.log);
```

## Related

* [libpg_query](https://github.com/lfittl/libpg_query)
* [pg_query](https://github.com/lfittl/pg_query)
* [pg_query.go](https://github.com/lfittl/pg_query.go)
