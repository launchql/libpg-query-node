const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const query = require('../');

const LONE_HIGH = '\uD800';
const LONE_LOW = '\uDC00';

function firstLiteral(result) {
  const aConst = result.stmts[0].stmt.SelectStmt.targetList[0].ResTarget.val.A_Const;
  return aConst.sval ? aConst.sval.sval : aConst.val.String.str;
}

describe('Query input encoding', () => {
  before(async () => {
    await query.parse('SELECT 1');
  });

  for (const count of [1, 2, 4, 8, 16, 64]) {
    it(`parses every statement after ${count} unpaired high surrogates`, () => {
      const result = query.parseSync(`SELECT '${LONE_HIGH.repeat(count)}'; SELECT 2`);
      assert.equal(result.stmts.length, 2);
    });
  }

  it('parses every statement after unpaired low surrogates', async () => {
    const result = await query.parse(`SELECT '${LONE_LOW.repeat(8)}'; SELECT 2`);
    assert.equal(result.stmts.length, 2);
  });

  it('reads an unpaired surrogate as U+FFFD, as a Postgres driver sends it', () => {
    const result = query.parseSync(`SELECT '${LONE_HIGH}x${LONE_LOW}'`);
    assert.equal(firstLiteral(result), '\uFFFDx\uFFFD');
  });

  it('keeps valid surrogate pairs intact', () => {
    const result = query.parseSync("SELECT '\u{1F600}'; SELECT 2");
    assert.equal(result.stmts.length, 2);
    assert.equal(firstLiteral(result), '\u{1F600}');
  });

  it('rejects an embedded NUL instead of dropping the rest of the query', async () => {
    assert.throws(() => query.parseSync('SELECT 1\u0000; SELECT 2'), /NUL/);
    await assert.rejects(query.parse('SELECT 1\u0000; SELECT 2'), /NUL/);
  });
});
