const query = require("../");
const { expect } = require("chai");

describe("PL/pgSQL Parsing", () => {
  before(async () => {
    await query.parseQuery("SELECT 1");
  });

  describe("Sync PL/pgSQL Parsing", () => {
    it("should parse a simple PL/pgSQL function", () => {
      const funcSql = `
        CREATE OR REPLACE FUNCTION test_func()
        RETURNS INTEGER AS $$
        BEGIN
          RETURN 42;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const result = query.parsePlPgSQLSync(funcSql);
      expect(result).to.be.an("object");
      expect(result.plpgsql_funcs).to.be.an("array");
    });

    it("should parse function with parameters", () => {
      const funcSql = `
        CREATE OR REPLACE FUNCTION add_numbers(a INTEGER, b INTEGER)
        RETURNS INTEGER AS $$
        BEGIN
          RETURN a + b;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const result = query.parsePlPgSQLSync(funcSql);
      expect(result.plpgsql_funcs).to.have.length.greaterThan(0);
    });

    it("should fail on invalid PL/pgSQL", () => {
      expect(() => query.parsePlPgSQLSync("NOT A FUNCTION")).to.throw(Error);
    });
  });

  describe("Async PL/pgSQL Parsing", () => {
    it("should return a promise resolving to same result", async () => {
      const funcSql = `
        CREATE OR REPLACE FUNCTION test_func()
        RETURNS INTEGER AS $$
        BEGIN
          RETURN 42;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const resultPromise = query.parsePlPgSQL(funcSql);
      const result = await resultPromise;

      expect(resultPromise).to.be.instanceof(Promise);
      expect(result).to.deep.eq(query.parsePlPgSQLSync(funcSql));
    });

    it("should reject on invalid PL/pgSQL", async () => {
      return query.parsePlPgSQL("NOT A FUNCTION").then(
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
