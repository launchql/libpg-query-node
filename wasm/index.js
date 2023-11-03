const PgQueryModule = require('./libpg-query.js');
const { getDefaultContext } = require('@emnapi/runtime');

let PgQuery;

const initPromise = PgQueryModule().then((module) => {
  const binding = module.emnapiInit({
    context: getDefaultContext(),
  });

  PgQuery = binding;
});

module.exports = {
  parseQuery(query) {
    return new Promise(async (resolve, reject) => {
      if (!PgQuery) {
        await initPromise;
      }

      PgQuery.parseQueryAsync(query, (err, result) => {
        err ? reject(err) : resolve(JSON.parse(result));
      });
    });
  },

  parsePlPgSQL(query) {
    return new Promise(async (resolve, reject) => {
      if (!PgQuery) {
        await initPromise;
      }

      PgQuery.parsePlPgSQLAsync(query, (err, result) => {
        err ? reject(err) : resolve(JSON.parse(result));
      });
    });
  },

  fingerprint(query) {
    return new Promise(async (resolve, reject) => {
      if (!PgQuery) {
        await initPromise;
      }

      PgQuery.fingerprintAsync(query, (err, result) => {
        err ? reject(err) : resolve(result);
      });
    });
  },
};
