const query = require("../");
const { expect } = require("chai");

describe("Query Scanning", () => {
  before(async () => {
    await query.parseQuery("SELECT 1");
  });

  describe("Sync Scanning", () => {
    it("should scan a simple query", () => {
      const scanned = query.scanSync("select 1");
      expect(scanned).to.be.an("object");
      expect(scanned.tokens).to.be.an("array");
    });

    it("should identify tokens in a query", () => {
      const scanned = query.scanSync("SELECT id FROM users");
      expect(scanned.tokens).to.have.length.greaterThan(0);
      
      const tokenValues = scanned.tokens.map(t => t.token);
      expect(tokenValues).to.include("SELECT");
      expect(tokenValues).to.include("FROM");
    });

    it("should provide token positions", () => {
      const scanned = query.scanSync("SELECT id");
      expect(scanned.tokens[0]).to.have.property("start");
      expect(scanned.tokens[0]).to.have.property("end");
      expect(scanned.tokens[0].start).to.be.a("number");
      expect(scanned.tokens[0].end).to.be.a("number");
    });

    it("should fail on invalid queries", () => {
      expect(() => query.scanSync("NOT A QUERY")).to.throw(Error);
    });
  });

  describe("Async Scanning", () => {
    it("should return a promise resolving to same result", async () => {
      const testQuery = "SELECT * FROM users";
      const scannedPromise = query.scan(testQuery);
      const scanned = await scannedPromise;

      expect(scannedPromise).to.be.instanceof(Promise);
      expect(scanned).to.deep.eq(query.scanSync(testQuery));
    });

    it("should reject on bogus queries", async () => {
      return query.scan("NOT A QUERY").then(
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
