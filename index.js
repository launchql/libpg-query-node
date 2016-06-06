var PgQuery = require('./libs/pg-query');

module.exports = {
  parse: function(query) {
    var result = PgQuery.parse(query);

    if (result.error) {
      var err = new Error(result.error.message);

      err.fileName = result.error.fileName;
      err.lineNumber = result.error.lineNumber;
      err.cursorPosition = result.error.cursorPosition;
      err.functionName = result.error.functionName;
      err.context = result.error.context;

      result.error = err;
    }

    return result;
  }
};
