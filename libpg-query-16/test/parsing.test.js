const query = require("../wasm");
const { expect } = require("chai");

function removeLocationProperties(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeLocationProperties(item));
  }
  
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (key === 'location' || key === 'stmt_len' || key === 'stmt_location') {
        continue;
      }
      result[key] = removeLocationProperties(obj[key]);
    }
  }
  return result;
}

describe("PostgreSQL 16 Query Parsing (Lightweight)", () => {
  before(async () => {
    await query.parse("SELECT 1");
  });

  describe("Sync Parsing", () => {
    it("should return a single-item parse result for common queries", () => {
      const queries = ["select 1", "select null", "select ''", "select a, b"];
      const results = queries.map(query.parseSync);
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
      const res = query.parseSync("select 1; select null;");
      expect(res.stmts.map(removeLocationProperties)).to.deep.eq([
        ...query.parseSync("select 1;").stmts.map(removeLocationProperties),
        ...query.parseSync("select null;").stmts.map(removeLocationProperties),
      ]);
    });

    it("should not parse a bogus query", () => {
      expect(() => query.parseSync("NOT A QUERY")).to.throw(Error);
    });
  });

  describe("Async parsing", () => {
    it("should return a promise resolving to same result", async () => {
      const testQuery = "select * from john;";
      const resPromise = query.parse(testQuery);
      const res = await resPromise;

      expect(resPromise).to.be.instanceof(Promise);
      expect(res).to.deep.eq(query.parseSync(testQuery));
    });

    it("should reject on bogus queries", async () => {
      return query.parse("NOT A QUERY").then(
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

  describe("Lightweight version restrictions", () => {
    it("should not have deparse functionality", () => {
      expect(query.deparse).to.be.undefined;
      expect(query.deparseSync).to.be.undefined;
    });

    it("should not have scan functionality", () => {
      expect(query.scan).to.be.undefined;
      expect(query.scanSync).to.be.undefined;
    });
  });
});
