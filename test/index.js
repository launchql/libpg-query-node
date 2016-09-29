var query = require('../');
var assert = require('assert');
var expect = require('chai').expect;

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
  it('should parse a query', function(done) {
    expect(query.parseQueryAsync('select 1')).to.be.a('object');
    done();
  });

  it('should parse a null', function(done) {
    return query.parseQueryAsync("select null")
    .then(result => {
      expect(result.query[0].SelectStmt.targetList[0].ResTarget.val.A_Const.val.Null).to.eql({});
      done();
    })
    .catch(err => {
      done(err);
    });
  });

  it('should parse an empty string', function(done) {
    return query.parseQueryAsync("select ''")
    .then(result => {
      expect(result.query[0].SelectStmt.targetList[0].ResTarget.val.A_Const.val.String.str).to.equal('');
      done();
    })
    .catch(err => {
      assert.equal(err, null);
      done(err);
    });

  });

  it('should not parse a bogus query', function(done) {
    return query.parseQueryAsync("NOT A QUERY")
    .then(result => {
      done(new Error('result should be null'));
    })
    .catch(err => {
      expect(err).to.be.an('error');
      done();
    });
  });
});
