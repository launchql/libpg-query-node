# libpg-query

<p align="center" width="100%">
    <img src="https://github.com/launchql/libpg-query-node/assets/545047/5fd420cc-cdc6-4211-9b0f-0eca8321ba72" alt="webincubator" width="100">
</p>

<p align="center" width="100%">
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/npm/dt/libpg-query"></a>
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/npm/dw/libpg-query"/></a>
   <a href="https://github.com/launchql/libpg-query/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/libpg-query"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/libpg-query-node"/></a><br />
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/run-tests-linux.yml">
    <img height="20" src="https://github.com/launchql/libpg-query-node/actions/workflows/run-tests-linux.yml/badge.svg" />
   </a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/run-tests-mac.yml">
    <img height="20" src="https://github.com/launchql/libpg-query-node/actions/workflows/run-tests-mac.yml/badge.svg" />
   </a>
   <a href="https://github.com/launchql/libpg-query-node/actions/workflows/run-tests-win.yml">
    <img height="20" src="https://github.com/launchql/libpg-query-node/actions/workflows/run-tests-win.yml/badge.svg" />
   </a>
</p>

The real PostgreSQL parser, exposed for nodejs.

Primarily used for the node.js parser and deparser [pgsql-parser](https://github.com/pyramation/pgsql-parser)


## Table of Contents

1. [Installation](#installation)
2. [Example](#example)
5. [Documentation](#documentation)
3. [Versions](#versions)
4. [Building a binary distribution](#building-a-binary-distribution)
6. [Related Projects](#related-projects)
7. [Credit](#credit)


## Installation

```sh
npm install libpg-query
```

## Example

```js
const parser = require('libpg-query');
parser.parseQuery('select 1').then(console.log);
```

### Documentation

### `query.parseQuery(sql)`/`parseQuerySync`

Parses the sql and returns a Promise for the parse tree (or returns the parse tree directly in the sync version). May reject with/throw a parse error.

The return value is an array, as multiple queries may be provided in a single string (semicolon-delimited, as Postgres expects).

### `query.parsePlPgSQL(funcsSql)`/`query.parsePlPgSQLSync(funcsSql)`

Parses the contents of a PL/PGSql function, from a `CREATE FUNCTION` declaration, and returns a Promise for the parse tree (or returns the parse tree directly in the sync version). May reject with/throw a parse error.

## Versions

Our latest is built with `16-latest` branch from libpg_query


| PG Major Version | libpg_query | Branch                                                                                         | npm 
|--------------------------|-------------|------------------------------------------------------------------------------------------------|---------|
| 16                       | 16-latest   | [`16-latest`](https://github.com/launchql/libpg-query-node/tree/16-latest)                       | [`libpg-query@16.2.0`](https://www.npmjs.com/package/libpg-query/v/latest)
| 15                       | 15-latest   | [`15-latest`](https://github.com/launchql/libpg-query-node/tree/15-latest)                       | [`libpg-query@15.1.0`](https://www.npmjs.com/package/libpg-query/v/15.1.0)
| 14                       | 14-latest   | [`14-latest`](https://github.com/launchql/libpg-query-node/tree/14-latest)                       | [`libpg-query@14.0.0`](https://www.npmjs.com/package/libpg-query/v/14.0.0)
| 13                       | 13-latest   | [`13-latest`](https://github.com/launchql/libpg-query-node/tree/13-latest)                       | [`libpg-query@13.3.1`](https://www.npmjs.com/package/libpg-query/v/13.3.1)
| 12                       | (n/a)       |                                                                                                |
| 11                       | (n/a)       |                                                                                                |
| 10                       | 10-latest   |                        | `@1.3.1` ([tree](https://github.com/pyramation/pgsql-parser/tree/39b7b1adc8914253226e286a48105785219a81ca))      |


## Building a binary distribution

- Install requirements (`npm i`)
- `npx node-pre-gyp rebuild package`
- With appropriate AWS credentials configured, `npx node-pre-gyp publish`

Or you can run the scripts

```
npm run binary:build
npm run binary:publish
```

## Related Projects

* [libpg_query](https://github.com/pganalyze/libpg_query)
* [pgsql-parser](https://github.com/pyramation/pgsql-parser)
* [pg_query](https://github.com/lfittl/pg_query)
* [pg_query.go](https://github.com/lfittl/pg_query.go)

## Credit

This is based on the output of [libpg_query](https://github.com/pganalyze/libpg_query). This wraps the static library output and links it into a node module for use in js.

All credit for the hard problems goes to [Lukas Fittl](https://github.com/lfittl).

Additional thanks for node binding [Ethan Resnick](https://github.com/ethanresnick).

Original [Code](https://github.com/zhm/node-pg-query-native) and [License](https://github.com/zhm/node-pg-query-native/blob/master/LICENSE.md)
