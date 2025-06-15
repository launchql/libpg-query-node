const query = require("../");
const { expect } = require("chai");

describe("Query Fingerprinting", () => {
  before(async () => {
    await query.parseQuery("SELECT 1");
  });

  describe("Sync Fingerprinting", () => {
    it("should return a fingerprint for a simple query", () => {
      const fingerprint = query.fingerprintSync("select 1");
      expect(fingerprint).to.be.a("string");
      expect(fingerprint).to.have.lengthOf(16);
    });

    it("should return same fingerprint for equivalent queries", () => {
      const fp1 = query.fingerprintSync("select 1");
      const fp2 = query.fingerprintSync("SELECT 1");
      const fp3 = query.fingerprintSync("select   1");
      
      expect(fp1).to.eq(fp2);
      expect(fp1).to.eq(fp3);
    });

    it("should return different fingerprints for different queries", () => {
      const fp1 = query.fingerprintSync("select name from users");
      const fp2 = query.fingerprintSync("select id from customers");
      
      expect(fp1).to.not.eq(fp2);
    });

    it("should normalize parameter values", () => {
      const fp1 = query.fingerprintSync("select * from users where id = 123");
      const fp2 = query.fingerprintSync("select * from users where id = 456");
      
      expect(fp1).to.eq(fp2);
    });

    it("should fail on invalid queries", () => {
      expect(() => query.fingerprintSync("NOT A QUERY")).to.throw(Error);
    });
  });

  describe("Async Fingerprinting", () => {
    it("should return a promise resolving to same result", async () => {
      const testQuery = "select * from users";
      const fpPromise = query.fingerprint(testQuery);
      const fp = await fpPromise;

      expect(fpPromise).to.be.instanceof(Promise);
      expect(fp).to.eq(query.fingerprintSync(testQuery));
    });

    it("should reject on bogus queries", async () => {
      return query.fingerprint("NOT A QUERY").then(
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
