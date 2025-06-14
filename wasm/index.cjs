const { getDefaultContext } = require('@emnapi/runtime');
const { pg_query } = require('../proto.js');
const PgQueryModule = require('./libpg-query.js');

let PgQuery;

const initPromise = PgQueryModule().then((module) => {
  const binding = module.emnapiInit({
    context: getDefaultContext(),
  });

  PgQuery = binding;
});

function awaitInit(fn) {
  return async (...args) => {
    await initPromise;
    return fn(...args);
  };
}

const parseQuery = awaitInit((query) => {
  return new Promise(async (resolve, reject) => {
    PgQuery.parseQueryAsync(query, (err, result) => {
      err ? reject(err) : resolve(JSON.parse(result));
    });
  });
});

const deparse = awaitInit((parseTree) => {
  const msg = pg_query.ParseResult.fromObject(parseTree);
  const data = pg_query.ParseResult.encode(msg).finish();
  return new Promise((resolve, reject) => {
    PgQuery.deparseAsync(data, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  });
});

const parsePlPgSQL = awaitInit((query) => {
  return new Promise(async (resolve, reject) => {
    PgQuery.parsePlPgSQLAsync(query, (err, result) => {
      err ? reject(err) : resolve(JSON.parse(result));
    });
  });
});

const fingerprint = awaitInit((query) => {
  return new Promise(async (resolve, reject) => {
    PgQuery.fingerprintAsync(query, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  });
});

module.exports = {
  parseQuery,
  deparse,
  parsePlPgSQL,
  fingerprint
};
