# libpg-query

The real PostgreSQL parser, exposed for nodejs.

Primarily used for the node.js parser and deparser [pgsql-parser](https://github.com/pyramation/pgsql-parser)

## Building a binary distribution

- Install requirements (`npm i`)
- `npx node-pre-gyp rebuild package`
- With appropriate AWS credentials configured, `npx node-pre-gyp publish`

Or you can run the scripts

```
npm run binary:build
npm run binary:publish
```

## Installation

```sh
npm install libpg-query
```

### Documentation

### `query.parseQuery(sql)`/`parseQuerySync`

Parses the sql and returns a Promise for the parse tree (or returns the parse tree directly in the sync version). May reject with/throw a parse error.

The return value is an array, as multiple queries may be provided in a single string (semicolon-delimited, as Postgres expects).

### `query.parsePlPgSQL(funcsSql)`/`query.parsePlPgSQLSync(funcsSql)`

Parses the contents of a PL/PGSql function, from a `CREATE FUNCTION` declaration, and returns a Promise for the parse tree (or returns the parse tree directly in the sync version). May reject with/throw a parse error.

## Example

```js
const parser = require('libpg-query');
parser.parseQuery('select 1').then(console.log);
```

## Versions

Our latest is built with `15-latest` branch from libpg_query

| PostgreSQL Major Version | libpg_query | Status              | npm 
|--------------------------|-------------|---------------------|---------|
| 15                       | 15-latest   | Supported           | [`latest`](https://www.npmjs.com/package/libpg-query/v/latest)
| 14                       | 14-latest   | Supported           | [`libpg-query@14.0.0`](https://www.npmjs.com/package/libpg-query/v/14.0.0)
| 13                       | 13-latest   | Supported           | [`libpg-query@13.3.1`](https://www.npmjs.com/package/libpg-query/v/13.3.1)
| 12                       | (n/a)       | Not supported       |
| 11                       | (n/a)       | Not supported       |
| 10                       | 10-latest   | Not supported       | `@1.3.1` ([tree](https://github.com/pyramation/pgsql-parser/tree/39b7b1adc8914253226e286a48105785219a81ca))      | 

## Related

* [libpg_query](https://github.com/pganalyze/libpg_query)
* [pgsql-parser](https://github.com/pyramation/pgsql-parser)
* [pg_query](https://github.com/lfittl/pg_query)
* [pg_query.go](https://github.com/lfittl/pg_query.go)

## Credit

This is based on the output of [libpg_query](https://github.com/pganalyze/libpg_query). This wraps the static library output and links it into a node module for use in js.

All credit for the hard problems goes to [Lukas Fittl](https://github.com/lfittl).

Additional thanks for node binding [Ethan Resnick](github.com/ethanresnick).

Original [Code](https://github.com/zhm/node-pg-query-native) and [License](https://github.com/zhm/node-pg-query-native/blob/master/LICENSE.md)
