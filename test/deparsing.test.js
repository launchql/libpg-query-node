const query = require("../");
const { expect } = require("chai");

describe("Query Deparsing", () => {
  before(async () => {
    await query.parseQuery("SELECT 1");
  });

  describe("Sync Deparsing", () => {
    it("should deparse a simple query", () => {
      const sql = 'SELECT * FROM users';
      const parseTree = query.parseQuerySync(sql);
      const deparsed = query.deparseSync(parseTree);
      expect(deparsed).to.equal(sql);
    });

    it("should deparse a complex query", () => {
      const sql = 'SELECT a, b, c FROM t1 JOIN t2 ON t1.id = t2.id WHERE t1.x > 10';
      const parseTree = query.parseQuerySync(sql);
      const deparsed = query.deparseSync(parseTree);
      expect(deparsed).to.equal(sql);
    });

    it("should fail to deparse without protobuf data", () => {
      expect(() => query.deparseSync({})).to.throw('No parseTree provided');
    });
  });

  describe("Async Deparsing", () => {
    it("should return a promise resolving to same result", async () => {
      const sql = 'SELECT * FROM users';
      const parseTree = await query.parseQuery(sql);
      const deparsed = await query.deparse(parseTree);
      expect(deparsed).to.equal(sql);
    });

    it("should reject when no protobuf data", async () => {
      try {
        await query.deparse({});
        throw new Error('should have rejected');
      } catch (err) {
        expect(err.message).to.equal('No parseTree provided');
      }
    });
  });

  describe("Round-trip parsing and deparsing", () => {
    it("should maintain query semantics through round-trip", async () => {
      const sql = 'SELECT a, b, c FROM t1 JOIN t2 ON t1.id = t2.id WHERE t1.x > 10';
      const parseTree = await query.parseQuery(sql);
      const deparsed = await query.deparse(parseTree);
      expect(deparsed).to.equal(sql);
    });
  });

  it('should deparse a parse tree', async () => {
    const sql = 'SELECT * FROM users';
    const parseTree = await query.parseQuery(sql);
    const deparsed = await query.deparse(parseTree);
    expect(deparsed).to.equal(sql);
  });

  it('should throw on invalid parse tree', () => {
    try {
      query.deparseSync({});
    } catch (err) { }
    expect(() => query.deparseSync({})).to.throw('No parseTree provided');
  });
});
