import { ParseResult } from "@pgsql/types";
export * from "@pgsql/types";
export interface ScanToken {
    start: number;
    end: number;
    text: string;
    tokenType: number;
    tokenName: string;
    keywordKind: number;
    keywordName: string;
}
export interface ScanResult {
    version: number;
    tokens: ScanToken[];
}
export declare function loadModule(): Promise<void>;
export declare const parse: (query: string) => Promise<ParseResult>;
export declare const deparse: (parseTree: ParseResult) => Promise<string>;
export declare const parsePlPgSQL: (query: string) => Promise<ParseResult>;
export declare const fingerprint: (query: string) => Promise<string>;
export declare const normalize: (query: string) => Promise<string>;
export declare function parseSync(query: string): ParseResult;
export declare function deparseSync(parseTree: ParseResult): string;
export declare function parsePlPgSQLSync(query: string): ParseResult;
export declare function fingerprintSync(query: string): string;
export declare function normalizeSync(query: string): string;
export declare const scan: (query: string) => Promise<ScanResult>;
export declare function scanSync(query: string): ScanResult;
