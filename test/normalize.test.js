const query = require("../");
const { expect } = require("chai");

describe("Query Normalization", () => {
  before(async () => {
    await query.parseQuery("SELECT 1");
  });

  describe("Sync Normalization", () => {
    it("should normalize a simple query", () => {
      const normalized = query.normalizeSync("select 1");
      expect(normalized).to.be.a("string");
      expect(normalized).to.include("SELECT");
    });

    it("should normalize parameter values", () => {
      const normalized1 = query.normalizeSync("select * from users where id = 123");
      const normalized2 = query.normalizeSync("select * from users where id = 456");
      
      expect(normalized1).to.eq(normalized2);
      expect(normalized1).to.include("$1");
    });

    it("should normalize string literals", () => {
      const normalized1 = query.normalizeSync("select * from users where name = 'john'");
      const normalized2 = query.normalizeSync("select * from users where name = 'jane'");
      
      expect(normalized1).to.eq(normalized2);
      expect(normalized1).to.include("$1");
    });

    it("should preserve query structure", () => {
      const normalized = query.normalizeSync("SELECT id, name FROM users WHERE active = true ORDER BY name");
      
      expect(normalized).to.include("SELECT");
      expect(normalized).to.include("FROM");
      expect(normalized).to.include("WHERE");
      expect(normalized).to.include("ORDER BY");
    });

    it("should fail on invalid queries", () => {
      expect(() => query.normalizeSync("NOT A QUERY")).to.throw(Error);
    });
  });

  describe("Async Normalization", () => {
    it("should return a promise resolving to same result", async () => {
      const testQuery = "select * from users where id = 123";
      const normalizedPromise = query.normalize(testQuery);
      const normalized = await normalizedPromise;

      expect(normalizedPromise).to.be.instanceof(Promise);
      expect(normalized).to.eq(query.normalizeSync(testQuery));
    });

    it("should reject on bogus queries", async () => {
      return query.normalize("NOT A QUERY").then(
        () => {
          throw new Error("should have rejected");
        },
        (e) => {
          expect(e).instanceof(Error);
          expect(e.message).to.match(/NOT/);
        }
      );
    });
  });
});
