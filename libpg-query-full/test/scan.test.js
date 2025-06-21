const query = require("../wasm");
const { expect } = require("chai");

describe("PostgreSQL 17 Query Scanning (Full)", () => {
  before(async () => {
    await query.parse("SELECT 1");
  });

  describe("Sync Scanning", () => {
    it("should return a scan result with version and tokens", () => {
      const result = query.scanSync("SELECT 1");
      
      expect(result).to.be.an("object");
      expect(result).to.have.property("version");
      expect(result).to.have.property("tokens");
      expect(result.version).to.be.a("number");
      expect(result.tokens).to.be.an("array");
    });

    it("should scan a simple SELECT query correctly", () => {
      const result = query.scanSync("SELECT 1");
      
      expect(result.tokens).to.have.lengthOf(2);
      
      const selectToken = result.tokens[0];
      expect(selectToken.text).to.eq("SELECT");
      expect(selectToken.start).to.eq(0);
      expect(selectToken.end).to.eq(6);
      
      const numberToken = result.tokens[1];
      expect(numberToken.text).to.eq("1");
      expect(numberToken.start).to.eq(7);
      expect(numberToken.end).to.eq(8);
    });

    it("should scan tokens with correct positions", () => {
      const sql = "SELECT * FROM users";
      const result = query.scanSync(sql);
      
      expect(result.tokens).to.have.lengthOf(4);
      
      result.tokens.forEach(token => {
        const actualText = sql.substring(token.start, token.end);
        expect(token.text).to.eq(actualText);
      });
    });
  });

  describe("Async Scanning", () => {
    it("should return a promise resolving to same result as sync", async () => {
      const testQuery = "SELECT * FROM users WHERE id = $1";
      const resultPromise = query.scan(testQuery);
      const result = await resultPromise;

      expect(resultPromise).to.be.instanceof(Promise);
      expect(result).to.deep.eq(query.scanSync(testQuery));
    });

    it("should handle complex queries asynchronously", async () => {
      const testQuery = "SELECT COUNT(*) as total FROM orders WHERE status = 'completed'";
      const result = await query.scan(testQuery);
      
      expect(result).to.be.an("object");
      expect(result.tokens).to.be.an("array");
      expect(result.tokens.length).to.be.greaterThan(5);
    });
  });
});
