const PgQuery = require('./build/Release/queryparser.node');

module.exports = {
  parseQuery(query) {
    return new Promise((resolve, reject) => {
      PgQuery.parseQueryAsync(query, (err, result) => {
        err ? reject(err) : resolve(JSON.parse(result));
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


  deparse(parseTree) {
    // assuming parseTree is a Buffer containing the serialized parse tree data
    return new Promise((resolve, reject) => {
      PgQuery.deparseAsync(parseTree, (err, result) => {
        err ? reject(err) : resolve(result);
      });
    });
  },

  deparseSync(parseTree) {
    // assuming parseTree is a Buffer for the synchronous version
    return PgQuery.deparseSync(parseTree);
  }

};
