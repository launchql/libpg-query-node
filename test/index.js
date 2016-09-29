var query = require('../');
var assert = require('assert');

describe('pg-query sync', function() {
  it('should parse a query', function() {
    assert.equal(typeof query.parseQuery('select 1').query[0].SelectStmt, 'object');
  });

  it('should parse a null', function() {
    assert(query.parseQuery("select null").query[0].SelectStmt.targetList[0].ResTarget.val.A_Const.val.Null);
  });

  it('should parse an empty string', function() {
    assert(query.parseQuery("select ''").query[0].SelectStmt.targetList[0].ResTarget.val.A_Const.val.String.str === '');
  });

  it('should not parse a bogus query', function() {
    assert.ok(query.parseQuery('NOT A QUERY').error instanceof Error);
  });
});


describe('pg-query async', function() {
  it('should parse a query', function() {
    assert.equal(typeof query.parseQueryAsync('select 1'), 'object');
  });

  it('should parse a null', function() {
    return query.parseQueryAsync("select null")
    .then(result => {
      assert(result.query[0].SelectStmt.targetList[0].ResTarget.val.A_Const.val.Null);
    })
    .catch(err => {
      assert.equal(err, null);
    });
  });

  it('should parse an empty string', function() {
    return query.parseQueryAsync("select ''")
    .then(result => {
      assert(result.query[0].SelectStmt.targetList[0].ResTarget.val.A_Const.val.String.str === '');
    })
    .catch(err => {
      assert.equal(err, null);
    });

  });

  it('should not parse a bogus query', function() {
    return query.parseQueryAsync("select null")
    .then(result => {
      assert(result, null);
    })
    .catch(err => {
      assert.ok(err instanceof Error);
    });
  });
});
