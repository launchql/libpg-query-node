export interface ParserOptions {
  version?: 15 | 16 | 17;
}

export interface ParseResult {
  stmts: any[];
  version?: number;
}

export interface ScanResult {
  version: number;
  tokens: Array<{
    text: string;
    start: number;
    end: number;
    tokenName: string;
    keywordName: string;
  }>;
}

export declare class Parser {
  constructor(options?: ParserOptions);
  
  parse(query: string): Promise<ParseResult>;
  parseSync(query: string): ParseResult;
  
  parsePlPgSQL(query: string): Promise<any>;
  parsePlPgSQLSync(query: string): any;
  
  fingerprint(query: string): Promise<string>;
  fingerprintSync(query: string): string;
  
  normalize(query: string): Promise<string>;
  normalizeSync(query: string): string;
  
  deparse(tree: ParseResult): Promise<string>;
  deparseSync(tree: ParseResult): string;
  
  scan(query: string): Promise<ScanResult>;
  scanSync(query: string): ScanResult;
}

export declare function parse15(query: string): Promise<ParseResult>;
export declare function fingerprint15(query: string): Promise<string>;
export declare function normalize15(query: string): Promise<string>;
export declare function parsePlPgSQL15(query: string): Promise<any>;

export declare function parse16(query: string): Promise<ParseResult>;
export declare function fingerprint16(query: string): Promise<string>;
export declare function normalize16(query: string): Promise<string>;
export declare function parsePlPgSQL16(query: string): Promise<any>;
export declare function deparse16(tree: ParseResult): Promise<string>;

export declare function parse17(query: string): Promise<ParseResult>;
export declare function fingerprint17(query: string): Promise<string>;
export declare function normalize17(query: string): Promise<string>;
export declare function parsePlPgSQL17(query: string): Promise<any>;
export declare function deparse17(tree: ParseResult): Promise<string>;
export declare function scan17(query: string): Promise<ScanResult>;

export declare function parse(query: string): Promise<ParseResult>;
export declare function fingerprint(query: string): Promise<string>;
export declare function normalize(query: string): Promise<string>;
export declare function parsePlPgSQL(query: string): Promise<any>;
export declare function deparse(tree: ParseResult): Promise<string>;
export declare function scan(query: string): Promise<ScanResult>;
