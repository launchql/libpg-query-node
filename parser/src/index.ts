// Dynamic parser that loads the specified version at runtime
export class PgParser {
  private version: 15 | 16 | 17;
  private parser: any;

  constructor(version: 15 | 16 | 17 = 17) {
    this.version = version;
  }

  private async loadParser() {
    if (this.parser) return;
    
    switch (this.version) {
      case 15:
        this.parser = await import('../../versions/15/wasm/index.js');
        break;
      case 16:
        this.parser = await import('../../versions/16/wasm/index.js');
        break;
      case 17:
        this.parser = await import('../../versions/17/wasm/index.js');
        break;
    }
    
    if (this.parser.loadModule) {
      await this.parser.loadModule();
    }
  }

  async parse(query: string): Promise<any> {
    await this.loadParser();
    try {
      const result = await this.parser.parse(query);
      return { version: this.version, result };
    } catch (error: any) {
      return {
        version: this.version,
        error: {
          type: 'syntax',
          message: error.message,
          position: 0
        }
      };
    }
  }

  parseSync(query: string): any {
    if (!this.parser) {
      throw new Error('Parser not loaded. Call parse() first or use parseSync after parse()');
    }
    try {
      const result = this.parser.parseSync(query);
      return { version: this.version, result };
    } catch (error: any) {
      return {
        version: this.version,
        error: {
          type: 'syntax',
          message: error.message,
          position: 0
        }
      };
    }
  }
}

// Convenience functions
export async function parse(query: string, version: 15 | 16 | 17 = 17) {
  const parser = new PgParser(version);
  return parser.parse(query);
}

export function parseSync(query: string, version: 15 | 16 | 17 = 17) {
  throw new Error('parseSync requires parser to be loaded first. Use parse() or create a PgParser instance.');
}