const PgQuery = require('./build/Release/queryparser');
const logicError = new Error(
  "Expected a successful parse or a returned error; got neither."
);

module.exports = {
  parseQuery(query) {
    return new Promise((resolve, reject) => {
      PgQuery.parseQueryAsync(query, function(result) {
        console.log(result);
        resolve(result);
      });
    });

     /*
    return new Promise((resolve, reject) => {
      PgQuery.parseQueryAsync(query, function(result) {
        console.log("HHERE IN RESULT")
        if(!result.query && !result.error) {
          throw logicError;
        }

        if(result.error) {
          reject(jsifyParseError(result.error));
          return;
        }
        console.log("HERE resolve", result);
        resolve(result.query);
      });
    }).then(it => {
      console.log("IN THEN!!");
    });*/
  },

  parsePlPgSQL(query) {
    return new Promise((resolve, reject) => {
      return PgQuery.parsePlPgSQLAsync(query, function(result) {
        if(!result.functions && !result.error) {
          throw logicError;
        }

        if(result.error) {
          reject(jsifyParseError(result.error));
          return;
        }

        resolve(result.functions);
      });
    });
  },

  parseQuerySync(query) {
    const result = PgQuery.parseQuery(query);
    if(!result.query && !result.error) {
      throw logicError;
    }

    if(result.error) {
      throw jsifyParseError(result.error);
    }

    return result.query;
  },

  parsePlPgSQLSync(query) {
    const result = PgQuery.parsePlPgSQL(query);
    if(!result.functions && !result.error) {
      throw logicError;
    }

    if(result.error) {
      throw jsifyParseError(result.error);
    }

    return result.functions;
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
