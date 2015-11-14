var query = require('../');
var assert = require('assert');

describe('pg-query', function() {
  it('should parse a query', function() {
    assert.equal(typeof query.parse('select 1').query[0].SELECT, 'object');
  });

  it('should not parse a bogus query', function() {
    assert.ok(query.parse('NOT A QUERY').error instanceof Error);
  });
});
