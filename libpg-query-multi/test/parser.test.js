const { Parser } = require("../");
const { expect } = require("chai");

describe("Multi-Version Parser", () => {
  describe("Parser class instantiation", () => {
    it("should default to PostgreSQL 17", () => {
      const parser = new Parser();
      expect(parser.version).to.eq(17);
    });

    it("should accept version 15", () => {
      const parser = new Parser({ version: 15 });
      expect(parser.version).to.eq(15);
    });

    it("should accept version 16", () => {
      const parser = new Parser({ version: 16 });
      expect(parser.version).to.eq(16);
    });

    it("should accept version 17", () => {
      const parser = new Parser({ version: 17 });
      expect(parser.version).to.eq(17);
    });

    it("should throw error for unsupported version", () => {
      expect(() => new Parser({ version: 14 })).to.throw();
    });
  });

  describe("Version-specific functionality", () => {
    it("should parse queries with PG15", async () => {
      const parser = new Parser({ version: 15 });
      const result = await parser.parse("SELECT 1");
      expect(result.stmts).to.have.lengthOf(1);
    });

    it("should parse queries with PG16", async () => {
      const parser = new Parser({ version: 16 });
      const result = await parser.parse("SELECT 1");
      expect(result.stmts).to.have.lengthOf(1);
    });

    it("should parse queries with PG17", async () => {
      const parser = new Parser({ version: 17 });
      const result = await parser.parse("SELECT 1");
      expect(result.stmts).to.have.lengthOf(1);
    });

    it("should throw error when trying to deparse with PG15", async () => {
      const parser = new Parser({ version: 15 });
      const parseTree = await parser.parse("SELECT 1");
      
      try {
        await parser.deparse(parseTree);
        throw new Error("Should have thrown");
      } catch (error) {
        expect(error.message).to.include("Deparse functionality not available for PostgreSQL 15");
      }
    });

    it("should allow deparse with PG16", async () => {
      const parser = new Parser({ version: 16 });
      const parseTree = await parser.parse("SELECT 1");
      
      try {
        await parser.deparse(parseTree);
      } catch (error) {
        expect(error.message).to.not.include("not available");
      }
    });

    it("should allow deparse with PG17", async () => {
      const parser = new Parser({ version: 17 });
      const parseTree = await parser.parse("SELECT 1");
      
      try {
        await parser.deparse(parseTree);
      } catch (error) {
        expect(error.message).to.not.include("not available");
      }
    });

    it("should throw error when trying to scan with PG15", async () => {
      const parser = new Parser({ version: 15 });
      
      try {
        await parser.scan("SELECT 1");
        throw new Error("Should have thrown");
      } catch (error) {
        expect(error.message).to.include("Scan functionality not available for PostgreSQL 15");
      }
    });

    it("should throw error when trying to scan with PG16", async () => {
      const parser = new Parser({ version: 16 });
      
      try {
        await parser.scan("SELECT 1");
        throw new Error("Should have thrown");
      } catch (error) {
        expect(error.message).to.include("Scan functionality not available for PostgreSQL 16");
      }
    });

    it("should allow scan with PG17", async () => {
      const parser = new Parser({ version: 17 });
      
      try {
        const result = await parser.scan("SELECT 1");
        expect(result.tokens).to.be.an('array');
      } catch (error) {
        expect(error.message).to.not.include("not available");
      }
    });
  });

  describe("Named exports", () => {
    it("should export version-specific parse functions", async () => {
      const { parse15, parse16, parse17 } = require("../");
      
      expect(parse15).to.be.a('function');
      expect(parse16).to.be.a('function');
      expect(parse17).to.be.a('function');
    });

    it("should export default functions from PG17", async () => {
      const { parse, fingerprint, deparse, scan } = require("../");
      
      expect(parse).to.be.a('function');
      expect(fingerprint).to.be.a('function');
      expect(deparse).to.be.a('function');
      expect(scan).to.be.a('function');
    });
  });
});
