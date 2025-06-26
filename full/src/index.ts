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

export interface SqlErrorDetails {
  message: string;
  cursorPosition: number;
  fileName?: string;
  functionName?: string;
  lineNumber?: number;
  context?: string;
}

export class SqlError extends Error {
  sqlDetails?: SqlErrorDetails;
  
  constructor(message: string, details?: SqlErrorDetails) {
    super(message);
    this.name = 'SqlError';
    this.sqlDetails = details;
  }
}

export function hasSqlDetails(error: unknown): error is SqlError {
  return error instanceof SqlError && error.sqlDetails !== undefined;
}

export function formatSqlError(error: SqlError, query?: string, options?: {
  showPosition?: boolean;
  showSource?: boolean;
  useColors?: boolean;
}): string {
  const opts = { showPosition: true, showSource: true, useColors: false, ...options };
  let output = `Error: ${error.message}`;
  
  if (error.sqlDetails) {
    const details = error.sqlDetails;
    
    if (opts.showPosition && details.cursorPosition !== undefined) {
      output += `\nPosition: ${details.cursorPosition}`;
    }
    
    if (opts.showSource && (details.fileName || details.functionName || details.lineNumber)) {
      output += '\nSource:';
      if (details.fileName) output += ` file: ${details.fileName},`;
      if (details.functionName) output += ` function: ${details.functionName},`;
      if (details.lineNumber) output += ` line: ${details.lineNumber}`;
    }
    
    if (opts.showPosition && query && details.cursorPosition !== undefined && details.cursorPosition >= 0) {
      const lines = query.split('\n');
      let currentPos = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + 1; // +1 for newline
        if (currentPos + lineLength > details.cursorPosition) {
          const posInLine = details.cursorPosition - currentPos;
          output += `\n${lines[i]}`;
          output += '\n' + ' '.repeat(posInLine) + '^';
          break;
        }
        currentPos += lineLength;
      }
    }
  }
  
  return output;
}

// @ts-ignore
import PgQueryModule from './libpg-query.js';
// @ts-ignore
import { pg_query } from '../proto.js';

interface WasmModule {
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  _wasm_free_string: (ptr: number) => void;
  _wasm_parse_query: (queryPtr: number) => number;
  _wasm_parse_query_raw: (queryPtr: number) => number;
  _wasm_free_parse_result: (ptr: number) => void;
  _wasm_deparse_protobuf: (dataPtr: number, length: number) => number;
  _wasm_parse_plpgsql: (queryPtr: number) => number;
  _wasm_fingerprint: (queryPtr: number) => number;
  _wasm_normalize_query: (queryPtr: number) => number;
  _wasm_scan: (queryPtr: number) => number;
  lengthBytesUTF8: (str: string) => number;
  stringToUTF8: (str: string, ptr: number, len: number) => void;
  UTF8ToString: (ptr: number) => string;
  getValue: (ptr: number, type: string) => number;
  HEAPU8: Uint8Array;
}

let wasmModule: WasmModule;

const initPromise = PgQueryModule().then((module: WasmModule) => {
  wasmModule = module;
});

function ensureLoaded() {
  if (!wasmModule) throw new Error("WASM module not initialized. Call `loadModule()` first.");
}

export async function loadModule(): Promise<void> {
  if (!wasmModule) {
    await initPromise;
  }
}

function awaitInit<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    await initPromise;
    return fn(...args);
  }) as T;
}

function stringToPtr(str: string): number {
  ensureLoaded();
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof str}`);
  }
  const len = wasmModule.lengthBytesUTF8(str) + 1;
  const ptr = wasmModule._malloc(len);
  try {
    wasmModule.stringToUTF8(str, ptr, len);
    return ptr;
  } catch (error) {
    wasmModule._free(ptr);
    throw error;
  }
}

function ptrToString(ptr: number): string {
  ensureLoaded();
  if (typeof ptr !== 'number') {
    throw new TypeError(`Expected a number, got ${typeof ptr}`);
  }
  return wasmModule.UTF8ToString(ptr);
}

export const parse = awaitInit(async (query: string): Promise<ParseResult> => {
  // Input validation
  if (query === null || query === undefined) {
    throw new SqlError('Query cannot be null or undefined');
  }
  
  if (query === '') {
    throw new SqlError('Query cannot be empty');
  }

  const queryPtr = stringToPtr(query);
  let resultPtr = 0;
  
  try {
    resultPtr = wasmModule._wasm_parse_query_raw(queryPtr);
    if (!resultPtr) {
      throw new SqlError('Failed to parse query: memory allocation failed');
    }
    
    // Read the PgQueryParseResult struct
    const parseTreePtr = wasmModule.getValue(resultPtr, 'i32');
    const stderrBufferPtr = wasmModule.getValue(resultPtr + 4, 'i32');
    const errorPtr = wasmModule.getValue(resultPtr + 8, 'i32');
    
    if (errorPtr) {
      // Read PgQueryError struct
      const messagePtr = wasmModule.getValue(errorPtr, 'i32');
      const funcnamePtr = wasmModule.getValue(errorPtr + 4, 'i32');
      const filenamePtr = wasmModule.getValue(errorPtr + 8, 'i32');
      const lineno = wasmModule.getValue(errorPtr + 12, 'i32');
      const cursorpos = wasmModule.getValue(errorPtr + 16, 'i32');
      
      const message = messagePtr ? wasmModule.UTF8ToString(messagePtr) : 'Unknown error';
      const funcname = funcnamePtr ? wasmModule.UTF8ToString(funcnamePtr) : undefined;
      const filename = filenamePtr ? wasmModule.UTF8ToString(filenamePtr) : undefined;
      
      throw new SqlError(message, {
        message,
        cursorPosition: cursorpos,
        fileName: filename,
        functionName: funcname,
        lineNumber: lineno > 0 ? lineno : undefined
      });
    }
    
    if (!parseTreePtr) {
      throw new SqlError('No parse tree generated');
    }
    
    const parseTreeStr = wasmModule.UTF8ToString(parseTreePtr);
    return JSON.parse(parseTreeStr);
  } finally {
    wasmModule._free(queryPtr);
    if (resultPtr) {
      wasmModule._wasm_free_parse_result(resultPtr);
    }
  }
});

export const deparse = awaitInit(async (parseTree: ParseResult): Promise<string> => {
  if (!parseTree || typeof parseTree !== 'object' || !Array.isArray(parseTree.stmts) || parseTree.stmts.length === 0) {
    throw new Error('No parseTree provided');
  }

  const msg = pg_query.ParseResult.fromObject(parseTree);
  const data = pg_query.ParseResult.encode(msg).finish();
  
  const dataPtr = wasmModule._malloc(data.length);
  let resultPtr = 0;
  
  try {
    wasmModule.HEAPU8.set(data, dataPtr);
    resultPtr = wasmModule._wasm_deparse_protobuf(dataPtr, data.length);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.startsWith('ERROR')) {
      throw new Error(resultStr);
    }
    
    return resultStr;
  } finally {
    wasmModule._free(dataPtr);
    if (resultPtr) {
      wasmModule._wasm_free_string(resultPtr);
    }
  }
});

export const parsePlPgSQL = awaitInit(async (query: string): Promise<ParseResult> => {
  const queryPtr = stringToPtr(query);
  let resultPtr = 0;
  
  try {
    resultPtr = wasmModule._wasm_parse_plpgsql(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.startsWith('ERROR')) {
      throw new Error(resultStr);
    }
    
    return JSON.parse(resultStr);
  } finally {
    wasmModule._free(queryPtr);
    if (resultPtr) {
      wasmModule._wasm_free_string(resultPtr);
    }
  }
});

export const fingerprint = awaitInit(async (query: string): Promise<string> => {
  const queryPtr = stringToPtr(query);
  let resultPtr = 0;
  
  try {
    resultPtr = wasmModule._wasm_fingerprint(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.startsWith('ERROR')) {
      throw new Error(resultStr);
    }
    
    return resultStr;
  } finally {
    wasmModule._free(queryPtr);
    if (resultPtr) {
      wasmModule._wasm_free_string(resultPtr);
    }
  }
});

export const normalize = awaitInit(async (query: string): Promise<string> => {
  const queryPtr = stringToPtr(query);
  let resultPtr = 0;
  
  try {
    resultPtr = wasmModule._wasm_normalize_query(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.startsWith('ERROR')) {
      throw new Error(resultStr);
    }
    
    return resultStr;
  } finally {
    wasmModule._free(queryPtr);
    if (resultPtr) {
      wasmModule._wasm_free_string(resultPtr);
    }
  }
});

// Sync versions
export function parseSync(query: string): ParseResult {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  
  // Input validation
  if (query === null || query === undefined) {
    throw new SqlError('Query cannot be null or undefined');
  }
  
  if (query === '') {
    throw new SqlError('Query cannot be empty');
  }

  const queryPtr = stringToPtr(query);
  let resultPtr = 0;
  
  try {
    resultPtr = wasmModule._wasm_parse_query_raw(queryPtr);
    if (!resultPtr) {
      throw new SqlError('Failed to parse query: memory allocation failed');
    }
    
    // Read the PgQueryParseResult struct
    const parseTreePtr = wasmModule.getValue(resultPtr, 'i32');
    const stderrBufferPtr = wasmModule.getValue(resultPtr + 4, 'i32');
    const errorPtr = wasmModule.getValue(resultPtr + 8, 'i32');
    
    if (errorPtr) {
      // Read PgQueryError struct
      const messagePtr = wasmModule.getValue(errorPtr, 'i32');
      const funcnamePtr = wasmModule.getValue(errorPtr + 4, 'i32');
      const filenamePtr = wasmModule.getValue(errorPtr + 8, 'i32');
      const lineno = wasmModule.getValue(errorPtr + 12, 'i32');
      const cursorpos = wasmModule.getValue(errorPtr + 16, 'i32');
      
      const message = messagePtr ? wasmModule.UTF8ToString(messagePtr) : 'Unknown error';
      const funcname = funcnamePtr ? wasmModule.UTF8ToString(funcnamePtr) : undefined;
      const filename = filenamePtr ? wasmModule.UTF8ToString(filenamePtr) : undefined;
      
      throw new SqlError(message, {
        message,
        cursorPosition: cursorpos,
        fileName: filename,
        functionName: funcname,
        lineNumber: lineno > 0 ? lineno : undefined
      });
    }
    
    if (!parseTreePtr) {
      throw new SqlError('No parse tree generated');
    }
    
    const parseTreeStr = wasmModule.UTF8ToString(parseTreePtr);
    return JSON.parse(parseTreeStr);
  } finally {
    wasmModule._free(queryPtr);
    if (resultPtr) {
      wasmModule._wasm_free_parse_result(resultPtr);
    }
  }
}

export function deparseSync(parseTree: ParseResult): string {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  if (!parseTree || typeof parseTree !== 'object' || !Array.isArray(parseTree.stmts) || parseTree.stmts.length === 0) {
    throw new Error('No parseTree provided');
  }

  const msg = pg_query.ParseResult.fromObject(parseTree);
  const data = pg_query.ParseResult.encode(msg).finish();
  
  const dataPtr = wasmModule._malloc(data.length);
  let resultPtr = 0;
  
  try {
    wasmModule.HEAPU8.set(data, dataPtr);
    resultPtr = wasmModule._wasm_deparse_protobuf(dataPtr, data.length);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.startsWith('ERROR')) {
      throw new Error(resultStr);
    }
    
    return resultStr;
  } finally {
    wasmModule._free(dataPtr);
    if (resultPtr) {
      wasmModule._wasm_free_string(resultPtr);
    }
  }
}

export function parsePlPgSQLSync(query: string): ParseResult {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  const queryPtr = stringToPtr(query);
  let resultPtr = 0;
  
  try {
    resultPtr = wasmModule._wasm_parse_plpgsql(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.startsWith('ERROR')) {
      throw new Error(resultStr);
    }
    
    return JSON.parse(resultStr);
  } finally {
    wasmModule._free(queryPtr);
    if (resultPtr) {
      wasmModule._wasm_free_string(resultPtr);
    }
  }
}

export function fingerprintSync(query: string): string {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  const queryPtr = stringToPtr(query);
  let resultPtr = 0;
  
  try {
    resultPtr = wasmModule._wasm_fingerprint(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.startsWith('ERROR')) {
      throw new Error(resultStr);
    }
    
    return resultStr;
  } finally {
    wasmModule._free(queryPtr);
    if (resultPtr) {
      wasmModule._wasm_free_string(resultPtr);
    }
  }
}

export function normalizeSync(query: string): string {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  const queryPtr = stringToPtr(query);
  let resultPtr = 0;
  
  try {
    resultPtr = wasmModule._wasm_normalize_query(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.startsWith('ERROR')) {
      throw new Error(resultStr);
    }
    
    return resultStr;
  } finally {
    wasmModule._free(queryPtr);
    if (resultPtr) {
      wasmModule._wasm_free_string(resultPtr);
    }
  }
}

export const scan = awaitInit(async (query: string): Promise<ScanResult> => {
  const queryPtr = stringToPtr(query);
  let resultPtr = 0;
  
  try {
    resultPtr = wasmModule._wasm_scan(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.startsWith('ERROR')) {
      throw new Error(resultStr);
    }
    
    return JSON.parse(resultStr);
  } finally {
    wasmModule._free(queryPtr);
    if (resultPtr) {
      wasmModule._wasm_free_string(resultPtr);
    }
  }
});

export function scanSync(query: string): ScanResult {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  const queryPtr = stringToPtr(query);
  let resultPtr = 0;
  
  try {
    resultPtr = wasmModule._wasm_scan(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.startsWith('ERROR')) {
      throw new Error(resultStr);
    }
    
    return JSON.parse(resultStr);
  } finally {
    wasmModule._free(queryPtr);
    if (resultPtr) {
      wasmModule._wasm_free_string(resultPtr);
    }
  }
} 