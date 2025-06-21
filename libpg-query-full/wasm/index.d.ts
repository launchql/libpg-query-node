export * from "@pgsql/types";

export function loadModule(): Promise<void>;

export function parse(query: string): Promise<any>;
export function parseSync(query: string): any;

export function parsePlPgSQL(query: string): Promise<any>;
export function parsePlPgSQLSync(query: string): any;

export function fingerprint(query: string): Promise<string>;
export function fingerprintSync(query: string): string;

export function normalize(query: string): Promise<string>;
export function normalizeSync(query: string): string;

export function deparse(tree: any): Promise<string>;
export function deparseSync(tree: any): string;

export function scan(query: string): Promise<any>;
export function scanSync(query: string): any;
