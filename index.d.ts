import { ParseResult } from "@pgsql/types";

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
export function parseQueryDetailed(sql: string): Promise<ParseResult>;
export function parseQueryDetailedSync(sql: string): ParseResult;
export * from '@pgsql/types';
