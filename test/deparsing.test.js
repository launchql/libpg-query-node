const query = require("../");
const { expect } = require("chai");

describe("Query Deparsing", () => {
  before(async () => {
    await query.parseQuery("SELECT 1");
  });

  describe("Sync Deparsing", () => {
    it("should deparse a simple query", () => {
      const parsed = query.parseQuerySync("select 1");
      const deparsed = query.deparseSync(parsed);
      expect(deparsed).to.eq("SELECT 1");
    });

    it("should deparse a complex query", () => {
      const parsed = query.parseQuerySync("select a, b from users where id = 123");
      const deparsed = query.deparseSync(parsed);
      expect(deparsed).to.include("SELECT");
      expect(deparsed).to.include("FROM");
      expect(deparsed).to.include("WHERE");
    });

    it("should fail to deparse without protobuf data", () => {
      expect(() => query.deparseSync({})).to.throw(/No protobuf data found/);
    });
  });

  describe("Async Deparsing", () => {
    it("should return a promise resolving to same result", async () => {
      const parsed = await query.parseQuery("select 1");
      const deparsedPromise = query.deparse(parsed);
      const deparsed = await deparsedPromise;

      expect(deparsedPromise).to.be.instanceof(Promise);
      expect(deparsed).to.eq(query.deparseSync(parsed));
    });

    it("should reject when no protobuf data", async () => {
      return query.deparse({}).then(
        () => {
          throw new Error("should have rejected");
        },
        (e) => {
          expect(e).instanceof(Error);
          expect(e.message).to.match(/No protobuf data found/);
        }
      );
    });
  });

  describe("Round-trip parsing and deparsing", () => {
    it("should maintain query semantics through round-trip", async () => {
      const originalQuery = "SELECT id, name FROM users WHERE active = true ORDER BY name";
      const parsed = await query.parseQuery(originalQuery);
      const deparsed = await query.deparse(parsed);
      
      expect(deparsed).to.include("SELECT");
      expect(deparsed).to.include("FROM users");
      expect(deparsed).to.include("WHERE");
      expect(deparsed).to.include("ORDER BY");
    });
  });
});
