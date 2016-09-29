const Promise = require('bluebird');

const PgQuery = require('./build/Release/queryparser');

module.exports = {
  parseQuery: function(query) {
    const result = PgQuery.parseQuery(query);

    if (result.query) {
      result.query = JSON.parse(result.query);
    }

    if (result.error) {
      const err = new Error(result.error.message);

      err.fileName = result.error.fileName;
      err.lineNumber = result.error.lineNumber;
      err.cursorPosition = result.error.cursorPosition;
      err.functionName = result.error.functionName;
      err.context = result.error.context;

      result.error = err;
    }

    return result;
  },

  parseQueryAsync: function(query) {
    return new Promise((resolve, reject) => {
      return PgQuery.parseQueryAsync(query, function(err, result){
        if (err) {
          const error = new Error(err.message);

          error.fileName = err.fileName;
          error.lineNumber = err.lineNumber;
          error.cursorPosition = err.cursorPosition;
          error.functionName = err.functionName;
          error.context = err.context;

          return reject(error);
        }

        if (result.query) {
          result.query = JSON.parse(result.query);
        }

        return resolve(result);
      });
    });
  },
};
