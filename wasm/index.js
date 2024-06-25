import { getDefaultContext } from '@emnapi/runtime';
import { pg_query } from '../proto.js';
import PgQueryModule from './libpg-query.js';

let PgQuery;

const initPromise = PgQueryModule().then((module) => {
  const binding = module.emnapiInit({
    context: getDefaultContext(),
  });

  PgQuery = binding;
});

/**
 * Function wrapper that waits for the WASM module to initialize
 * before executing the function.
 */
function awaitInit(fn) {
  return async (...args) => {
    await initPromise;
    return fn(...args);
  };
}

export const parseQuery = awaitInit((query) => {
  return new Promise(async (resolve, reject) => {
    PgQuery.parseQueryAsync(query, (err, result) => {
      err ? reject(err) : resolve(JSON.parse(result));
    });
  });
});

export const deparse = awaitInit((parseTree) => {
  const msg = pg_query.ParseResult.fromObject(parseTree);
  const data = pg_query.ParseResult.encode(msg).finish();
  return new Promise((resolve, reject) => {
    PgQuery.deparseAsync(data, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  });
});

export const parsePlPgSQL = awaitInit((query) => {
  return new Promise(async (resolve, reject) => {
    PgQuery.parsePlPgSQLAsync(query, (err, result) => {
      err ? reject(err) : resolve(JSON.parse(result));
    });
  });
});

export const fingerprint = awaitInit((query) => {
  return new Promise(async (resolve, reject) => {
    PgQuery.fingerprintAsync(query, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  });
});
