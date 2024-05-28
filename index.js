const PgQuery = require('./build/Release/queryparser.node');

module.exports = {
  parseQuery(query) {
    return new Promise((resolve, reject) => {
      PgQuery.parseQueryAsync(query, (err, result) => {
        err ? reject(err) : resolve(JSON.parse(result));
      });
    });
  },

  deparseQuery(ast) {
    return new Promise((resolve, reject) => {
      PgQuery.deparseQueryAsync(JSON.stringify(ast), (err, result) => {
        err ? reject(err) : resolve(result);
      });
    });
  },

  parsePlPgSQL(query) {
    return new Promise((resolve, reject) => {
      PgQuery.parsePlPgSQLAsync(query, (err, result) => {
        err ? reject(err) : resolve(JSON.parse(result));
      });
    });
  },

  parseQuerySync(query) {
    return JSON.parse(PgQuery.parseQuerySync(query));
  },

  deparseQuerySync(ast) {
    return PgQuery.deparseQuerySync(JSON.stringify(ast));
  },

  parsePlPgSQLSync(query) {
    return JSON.parse(PgQuery.parsePlPgSQLSync(query));
  },

  fingerprint(query) {
    return new Promise((resolve, reject) => {
      PgQuery.fingerprintAsync(query, (err, result) => {
        err ? reject(err) : resolve(result);
      });
    });
  },

  fingerprintSync(query) {
    return PgQuery.fingerprintSync(query);
  },
};
