import { describe, it, expect } from 'vitest';
import { PgParser, parse } from '../wasm/index.js';
import * as v15 from '../wasm/v15.js';
import * as v16 from '../wasm/v16.js';
import * as v17 from '../wasm/v17.js';

describe('PgParser', () => {
  describe('Dynamic API', () => {
    it('should parse SQL with default version (17)', async () => {
      const result = await parse('SELECT 1+1 as sum');
      expect(result.version).toBe(17);
      expect(result.result).toBeDefined();
      expect(result.result.stmts).toHaveLength(1);
    });

    it('should parse SQL with version 15', async () => {
      const result = await parse('SELECT 1+1 as sum', 15);
      expect(result.version).toBe(15);
      expect(result.result).toBeDefined();
    });

    it('should handle parse errors', async () => {
      const result = await parse('INVALID SQL');
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('syntax');
      expect(result.error.message).toContain('syntax error');
    });

    it('should work with PgParser class', async () => {
      const parser = new PgParser(16);
      const result = await parser.parse('SELECT * FROM users');
      expect(result.version).toBe(16);
      expect(result.result).toBeDefined();
    });
  });

  describe('Static imports', () => {
    it('should parse with v15', async () => {
      await v15.loadModule();
      const result = await v15.parse('SELECT 1');
      expect(result).toBeDefined();
      expect(result.stmts).toHaveLength(1);
    });

    it('should parse with v16', async () => {
      await v16.loadModule();
      const result = await v16.parse('SELECT 1');
      expect(result).toBeDefined();
      expect(result.stmts).toHaveLength(1);
    });

    it('should parse with v17', async () => {
      await v17.loadModule();
      const result = await v17.parse('SELECT 1');
      expect(result).toBeDefined();
      expect(result.stmts).toHaveLength(1);
    });
  });
});