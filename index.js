const Promise = require('bluebird');
const PgQuery = require('./build/Release/queryparser');
const logicError = new Error(
  "Expected a successful parse or a returned error; got neither."
);

module.exports = {
  parseQuerySync(query) {
    const result = PgQuery.parseQuery(query);
    if(!result.query && !result.error) {
      throw logicError;
    }

    if (result.query) {
      return JSON.parse(result.query);
    } else {
      throw jsifyParseError(result.error);
    }
  },

  parseQuery(query) {
    return new Promise((resolve, reject) => {
      return PgQuery.parseQueryAsync(query, function(err, result) {
        if (err) {
          reject(jsifyParseError(err));
        } else if(result.query) {
          resolve(JSON.parse(result.query));
        } else {
          reject(logicError);
        }
      });
    });
  },
};

function jsifyParseError(err) {
  const error = new Error(err.message);
  error.fileName = err.fileName;
  error.lineNumber = err.lineNumber;
  error.cursorPosition = err.cursorPosition;
  error.functionName = err.functionName;
  error.context = err.context;
  return error;
}
