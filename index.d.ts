export function parseQuery(sql: string): Promise<any>;
export function parsePlPgSQL(funcsSql: string): Promise<any>;
export function parseQuerySync(sql: string): any;
export function deparseSync(obj: any): string;
export function deparseAsync(obj: any): Promise<string>;
export function parsePlPgSQLSync(funcsSql: string): any;
export function fingerprint(sql: string): Promise<string>;
export function fingerprintSync(sql: string): string;
