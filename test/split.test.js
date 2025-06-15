const query = require("../");
const { expect } = require("chai");

describe("Statement Splitting", () => {
  before(async () => {
    await query.parseQuery("SELECT 1");
  });

  describe("Sync Splitting", () => {
    it("should split a single statement", () => {
      const split = query.splitSync("SELECT 1");
      expect(split).to.be.an("object");
      expect(split.stmts).to.be.an("array");
      expect(split.stmts).to.have.lengthOf(1);
    });

    it("should split multiple statements", () => {
      const split = query.splitSync("SELECT 1; SELECT 2; SELECT 3;");
      expect(split.stmts).to.have.lengthOf(3);
    });

    it("should provide statement positions", () => {
      const split = query.splitSync("SELECT 1; SELECT 2;");
      expect(split.stmts[0]).to.have.property("stmt_location");
      expect(split.stmts[0]).to.have.property("stmt_len");
      expect(split.stmts[0].stmt_location).to.be.a("number");
      expect(split.stmts[0].stmt_len).to.be.a("number");
    });

    it("should handle statements with different lengths", () => {
      const split = query.splitSync("SELECT 1; SELECT id, name FROM users WHERE active = true;");
      expect(split.stmts).to.have.lengthOf(2);
      expect(split.stmts[0].stmt_len).to.be.lessThan(split.stmts[1].stmt_len);
    });

    it("should fail on invalid queries", () => {
      expect(() => query.splitSync("NOT A QUERY")).to.throw(Error);
    });
  });

  describe("Async Splitting", () => {
    it("should return a promise resolving to same result", async () => {
      const testQuery = "SELECT 1; SELECT 2;";
      const splitPromise = query.split(testQuery);
      const split = await splitPromise;

      expect(splitPromise).to.be.instanceof(Promise);
      expect(split).to.deep.eq(query.splitSync(testQuery));
    });

    it("should reject on bogus queries", async () => {
      return query.split("NOT A QUERY").then(
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
