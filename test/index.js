const query = require('../');
const { expect } = require('chai');
const { omit, cloneDeepWith } = require("lodash");

describe('Queries', () => {
  describe("Sync Parsing", () => {
    it("should return a single-item parse result for common queries", () => {
      const queries = ["select 1", "select null", "select ''", "select a, b"];
      const results = queries.map(query.parseQuerySync);
      results.forEach(res => {
        expect(res.stmts).to.have.lengthOf(1);
      });

      // Do some rough asserting on the shape of the result.
      // These tests aren't really meant to test the parsing functionality
      // itself, but doing a bit for sanity doesn't hurt.
      const selectedDatas = results.map(it => it.stmts[0].stmt.SelectStmt.targetList);

      expect(selectedDatas[0][0].ResTarget.val.A_Const.val.Integer.ival).to.eq(1);
      expect(selectedDatas[1][0].ResTarget.val.A_Const.val).to.have.property("Null");
      expect(selectedDatas[2][0].ResTarget.val.A_Const.val.String.str).to.eq('');
      expect(selectedDatas[3]).to.have.lengthOf(2);
    });

    it("should support parsing multiple queries", () => {
      const res = query.parseQuerySync("select 1; select null;");
      const changedProps = [
        "stmt_len",
        "stmt_location",
        "stmt.SelectStmt.targetList[0].ResTarget.location",
        "stmt.SelectStmt.targetList[0].ResTarget.val.A_Const.location"
      ];
      const removeChangedProps = (stmt) => omit(stmt, changedProps);
      expect(res.stmts.map(removeChangedProps)).to.deep.eq([
        ...(query.parseQuerySync("select 1;").stmts.map(removeChangedProps)),
        ...(query.parseQuerySync("select null;").stmts.map(removeChangedProps))
      ]);
    });

    it('should not parse a bogus query', () => {
      expect(() => query.parseQuerySync('NOT A QUERY')).to.throw(Error);
    });
  });

  describe("Async parsing", () => {
    it("should return a promise resolving to same result", async () => {
      const testQuery = 'select * from john;';
      const resPromise = query.parseQuery(testQuery);
      const res = await resPromise;

      expect(resPromise).to.be.instanceof(Promise);
      expect(res).to.deep.eq(query.parseQuerySync(testQuery));
    });

    it('should reject on bogus queries', async () => {
      return query.parseQuery("NOT A QUERY").then(() => {
        throw new Error("should have rejected");
      }, (e) => {
        expect(e).instanceof(Error);
        expect(e.message).to.match(/NOT/);
      });
    });
  })
});

describe('PlPgSQL (async)', () => {
  it('should parse a function', async () => {
    const testFunction = `
      CREATE FUNCTION t() RETURNS trigger AS
        $BODY$
        DECLARE
          resultVal integer;
          finalVal integer;
        BEGIN
          resultVal = 0;
          IF (resultVal >= 5)
            THEN finalVal = 'Yes';
            ELSE finalVal = 'No';
          END IF;
          RETURN finalVal;
        END;
        $BODY$
       LANGUAGE plpgsql;
     `;

    const resPromise = query.parsePlPgSQL(testFunction);
    const res = await resPromise;

    expect(resPromise).to.be.instanceof(Promise);
    expect(res).to.deep.have.property("0.PLpgSQL_function");
  });
});
