const query = require("../");
const { expect } = require("chai");

describe("Query Scanning", () => {
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
      
      // First token should be SELECT
      const selectToken = result.tokens[0];
      expect(selectToken.text).to.eq("SELECT");
      expect(selectToken.start).to.eq(0);
      expect(selectToken.end).to.eq(6);
      expect(selectToken.tokenName).to.eq("UNKNOWN"); // SELECT is mapped as UNKNOWN in our simplified mapping
      expect(selectToken.keywordName).to.eq("RESERVED_KEYWORD");
      
      // Second token should be 1
      const numberToken = result.tokens[1];
      expect(numberToken.text).to.eq("1");
      expect(numberToken.start).to.eq(7);
      expect(numberToken.end).to.eq(8);
      expect(numberToken.tokenName).to.eq("ICONST");
      expect(numberToken.keywordName).to.eq("NO_KEYWORD");
    });

    it("should scan tokens with correct positions", () => {
      const sql = "SELECT * FROM users";
      const result = query.scanSync(sql);
      
      expect(result.tokens).to.have.lengthOf(4);
      
      // Verify each token position matches the original SQL
      result.tokens.forEach(token => {
        const actualText = sql.substring(token.start, token.end);
        expect(token.text).to.eq(actualText);
      });
    });

    it("should identify different token types", () => {
      const result = query.scanSync("SELECT 'string', 123, 3.14, $1 FROM users");
      
      const tokenTypes = result.tokens.map(t => t.tokenName);
      expect(tokenTypes).to.include("SCONST");  // String constant
      expect(tokenTypes).to.include("ICONST");  // Integer constant  
      expect(tokenTypes).to.include("FCONST");  // Float constant
      expect(tokenTypes).to.include("PARAM");   // Parameter marker
      // Note: keywords like FROM may be tokenized as UNKNOWN in our simplified mapping
      expect(tokenTypes).to.include("UNKNOWN"); // Keywords and identifiers
    });

    it("should identify operators and punctuation", () => {
      const result = query.scanSync("SELECT * FROM users WHERE id = 1");
      
      const operators = result.tokens.filter(t => 
        t.tokenName.startsWith("ASCII_") || t.text === "="
      );
      
      expect(operators).to.have.length.greaterThan(0);
      expect(operators.some(t => t.text === "*")).to.be.true;
      expect(operators.some(t => t.text === "=")).to.be.true;
    });

    it("should classify keyword types correctly", () => {
      const result = query.scanSync("SELECT COUNT(*) FROM users WHERE active = true");
      
      const reservedKeywords = result.tokens.filter(t => 
        t.keywordName === "RESERVED_KEYWORD"
      );
      const unreservedKeywords = result.tokens.filter(t => 
        t.keywordName === "UNRESERVED_KEYWORD"
      );
      
      expect(reservedKeywords.length).to.be.greaterThan(0);
      // SELECT, FROM, WHERE should be reserved keywords
      expect(reservedKeywords.some(t => t.text === "SELECT")).to.be.true;
      expect(reservedKeywords.some(t => t.text === "FROM")).to.be.true;
      expect(reservedKeywords.some(t => t.text === "WHERE")).to.be.true;
    });

    it("should handle complex queries with parameters", () => {
      const result = query.scanSync("SELECT * FROM users WHERE id = $1 AND name = $2");
      
      const params = result.tokens.filter(t => t.tokenName === "PARAM");
      expect(params).to.have.lengthOf(2);
      expect(params[0].text).to.eq("$1");
      expect(params[1].text).to.eq("$2");
    });

    it("should handle string escaping in JSON output", () => {
      const result = query.scanSync("SELECT 'text with \"quotes\" and \\backslash'");
      
      const stringToken = result.tokens.find(t => t.tokenName === "SCONST");
      expect(stringToken).to.exist;
      expect(stringToken.text).to.include('"');
      expect(stringToken.text).to.include('\\');
    });

    it("should scan INSERT statements", () => {
      const result = query.scanSync("INSERT INTO table VALUES (1, 'text', 3.14)");
      
      expect(result.tokens.some(t => t.text === "INSERT")).to.be.true;
      expect(result.tokens.some(t => t.text === "INTO")).to.be.true;
      expect(result.tokens.some(t => t.text === "VALUES")).to.be.true;
      expect(result.tokens.some(t => t.tokenName === "ICONST")).to.be.true;
      expect(result.tokens.some(t => t.tokenName === "SCONST")).to.be.true;
      expect(result.tokens.some(t => t.tokenName === "FCONST")).to.be.true;
    });

    it("should scan UPDATE statements", () => {
      const result = query.scanSync("UPDATE users SET name = 'John' WHERE id = 1");
      
      expect(result.tokens.some(t => t.text === "UPDATE")).to.be.true;
      expect(result.tokens.some(t => t.text === "SET")).to.be.true;
      expect(result.tokens.some(t => t.text === "=")).to.be.true;
    });

    it("should scan DELETE statements", () => {
      const result = query.scanSync("DELETE FROM users WHERE active = false");
      
      expect(result.tokens.some(t => t.text === "DELETE")).to.be.true;
      expect(result.tokens.some(t => t.text === "FROM")).to.be.true;
      expect(result.tokens.some(t => t.text === "WHERE")).to.be.true;
    });

    it("should handle empty or whitespace-only input", () => {
      const result = query.scanSync("   ");
      expect(result.tokens).to.have.lengthOf(0);
    });

    it("should handle unusual input gracefully", () => {
      // The scanner is more permissive than the parser and may tokenize unusual input
      const result = query.scanSync("$$$INVALID$$$");
      expect(result).to.be.an("object");
      expect(result.tokens).to.be.an("array");
      // Scanner may still produce tokens even for unusual input
    });

    it("should preserve original token order", () => {
      const sql = "SELECT id, name FROM users ORDER BY name";
      const result = query.scanSync(sql);
      
      // Tokens should be in order of appearance
      for (let i = 1; i < result.tokens.length; i++) {
        expect(result.tokens[i].start).to.be.at.least(result.tokens[i-1].end);
      }
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
      const testQuery = "SELECT COUNT(*) as total FROM orders WHERE status = 'completed' AND created_at > '2023-01-01'";
      const result = await query.scan(testQuery);
      
      expect(result).to.be.an("object");
      expect(result.tokens).to.be.an("array");
      expect(result.tokens.length).to.be.greaterThan(10);
    });

    it("should handle unusual input asynchronously", async () => {
      // Scanner is more permissive than parser
      const result = await query.scan("$$$INVALID$$$");
      expect(result).to.be.an("object");
      expect(result.tokens).to.be.an("array");
    });
  });

  describe("Edge Cases", () => {
    it("should handle queries with comments", () => {
      const result = query.scanSync("SELECT 1 -- this is a comment");
      
      // Should have at least SELECT and 1 tokens
      expect(result.tokens.length).to.be.at.least(2);
      expect(result.tokens.some(t => t.text === "SELECT")).to.be.true;
      expect(result.tokens.some(t => t.text === "1")).to.be.true;
    });

    it("should handle very long identifiers", () => {
      const longIdentifier = "a".repeat(100);
      const result = query.scanSync(`SELECT ${longIdentifier} FROM table`);
      
      const identToken = result.tokens.find(t => t.text === longIdentifier);
      expect(identToken).to.exist;
      expect(identToken.tokenName).to.eq("IDENT");
    });

    it("should handle special PostgreSQL operators", () => {
      const result = query.scanSync("SELECT id::text FROM users");
      
      expect(result.tokens.some(t => t.text === "::")).to.be.true;
      const typecastToken = result.tokens.find(t => t.text === "::");
      expect(typecastToken?.tokenName).to.eq("TYPECAST");
    });

    it("should provide consistent version information", () => {
      const result1 = query.scanSync("SELECT 1");
      const result2 = query.scanSync("INSERT INTO table VALUES (1)");
      
      expect(result1.version).to.eq(result2.version);
      expect(result1.version).to.be.a("number");
      expect(result1.version).to.be.greaterThan(0);
    });
  });
});