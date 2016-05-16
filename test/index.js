var query = require('../');
var assert = require('assert');

describe('pg-query', function() {
  it('should parse a query', function() {
    assert.equal(typeof query.parse('select 1').query[0].SelectStmt, 'object');
  });

  it('should parse a null', function() {
    assert(query.parse("select null").query[0].SelectStmt.targetList[0].ResTarget.val.A_Const.val.Null);
  });

  it('should parse an empty string', function() {
    assert(query.parse("select ''").query[0].SelectStmt.targetList[0].ResTarget.val.A_Const.val.String.str === '');
  });

  it('should not parse a bogus query', function() {
    assert.ok(query.parse('NOT A QUERY').error instanceof Error);
  });
});
