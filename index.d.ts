import { ParseResult } from "@pgsql/types";

export interface ScanResult {
  tokens: Array<{
    token: string;
    start: number;
    end: number;
  }>;
}

export interface SplitResult {
  stmts: Array<{
    stmt_location: number;
    stmt_len: number;
  }>;
}

export function parseQuery(sql: string): Promise<ParseResult>;
export function parsePlPgSQL(funcsSql: string): Promise<any>;
export function parseQuerySync(sql: string): ParseResult;
export function parsePlPgSQLSync(funcsSql: string): any;
export function deparse(parseTree: any): Promise<string>;
export function deparseSync(parseTree: any): any;
export function fingerprint(sql: string): Promise<string>;
export function fingerprintSync(sql: string): string;
export function normalize(sql: string): Promise<string>;
export function normalizeSync(sql: string): string;
export function scan(sql: string): Promise<ScanResult>;
export function scanSync(sql: string): ScanResult;
export function split(sql: string): Promise<SplitResult>;
export function splitSync(sql: string): SplitResult;
export function parseQueryDetailed(sql: string): Promise<ParseResult>;
export * from '@pgsql/types';
