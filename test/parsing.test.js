const query = require("../");
const { expect } = require("chai");
const { omit } = require("lodash");

describe("Query Parsing", () => {
  before(async () => {
    await query.parseQuery("SELECT 1");
  });

  describe("Sync Parsing", () => {
    it("should return a single-item parse result for common queries", () => {
      const queries = ["select 1", "select null", "select ''", "select a, b"];
      const results = queries.map(query.parseQuerySync);
      results.forEach((res) => {
        expect(res.stmts).to.have.lengthOf(1);
      });

      const selectedDatas = results.map(
        (it) => it.stmts[0].stmt.SelectStmt.targetList
      );

      expect(selectedDatas[0][0].ResTarget.val.A_Const.ival.ival).to.eq(1);
      expect(selectedDatas[1][0].ResTarget.val.A_Const.isnull).to.eq(true);
      expect(selectedDatas[2][0].ResTarget.val.A_Const.sval.sval).to.eq("");
      expect(selectedDatas[3]).to.have.lengthOf(2);
    });

    it("should support parsing multiple queries", () => {
      const res = query.parseQuerySync("select 1; select null;");
      const changedProps = [
        "stmt_len",
        "stmt_location",
        "stmt.SelectStmt.targetList[0].ResTarget.location",
        "stmt.SelectStmt.targetList[0].ResTarget.val.A_Const.location",
      ];
      const removeChangedProps = (stmt) => omit(stmt, changedProps);
      expect(res.stmts.map(removeChangedProps)).to.deep.eq([
        ...query.parseQuerySync("select 1;").stmts.map(removeChangedProps),
        ...query.parseQuerySync("select null;").stmts.map(removeChangedProps),
      ]);
    });

    it("should not parse a bogus query", () => {
      expect(() => query.parseQuerySync("NOT A QUERY")).to.throw(Error);
    });
  });

  describe("Async parsing", () => {
    it("should return a promise resolving to same result", async () => {
      const testQuery = "select * from john;";
      const resPromise = query.parseQuery(testQuery);
      const res = await resPromise;

      expect(resPromise).to.be.instanceof(Promise);
      expect(res).to.deep.eq(query.parseQuerySync(testQuery));
    });

    it("should reject on bogus queries", async () => {
      return query.parseQuery("NOT A QUERY").then(
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

  describe("Detailed Error Parsing", () => {
    it("should provide detailed error information for invalid queries", async () => {
      try {
        await query.parseQueryDetailed("SELECT FROM");
        throw new Error("should have thrown");
      } catch (e) {
        expect(e.message).to.include("Parse error:");
        expect(e.message).to.include("line");
        expect(e.message).to.include("position");
      }
    });

    it("should parse valid queries with detailed parsing", async () => {
      const result = await query.parseQueryDetailed("SELECT 1");
      expect(result.stmts).to.have.lengthOf(1);
      expect(result.stmts[0].stmt.SelectStmt).to.exist;
    });
  });
});
