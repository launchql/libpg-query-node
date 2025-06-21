import { ParseResult, ScanResult } from '@pgsql/types';

declare const PgQueryModule: any;

let wasmModule: any = null;
let initPromise: Promise<any> | null = null;

function stringToPtr(str: string): number {
  const len = lengthBytesUTF8(str) + 1;
  const ptr = wasmModule._malloc(len);
  stringToUTF8(str, ptr, len);
  return ptr;
}

function ptrToString(ptr: number): string {
  return UTF8ToString(ptr);
}

function lengthBytesUTF8(str: string): number {
  return wasmModule.lengthBytesUTF8(str);
}

function stringToUTF8(str: string, ptr: number, len: number): void {
  wasmModule.stringToUTF8(str, ptr, len);
}

function UTF8ToString(ptr: number): string {
  return wasmModule.UTF8ToString(ptr);
}

async function awaitInit<T>(fn: () => T): Promise<T> {
  if (!wasmModule) {
    await loadModule();
  }
  return fn();
}

export async function loadModule(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = new Promise(async (resolve, reject) => {
    try {
      const PgQuery = await PgQueryModule();
      wasmModule = PgQuery;
      resolve(PgQuery);
    } catch (error) {
      reject(error);
    }
  });
  
  return initPromise;
}

export async function parse(query: string): Promise<ParseResult> {
  return awaitInit(() => parseSync(query));
}

export function parseSync(query: string): ParseResult {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  
  const queryPtr = stringToPtr(query);
  const resultPtr = wasmModule._wasm_parse_query(queryPtr);
  wasmModule._free(queryPtr);
  
  const resultStr = ptrToString(resultPtr);
  wasmModule._wasm_free_string(resultPtr);
  
  const result = JSON.parse(resultStr);
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result;
}

export async function scan(query: string): Promise<ScanResult> {
  return awaitInit(() => scanSync(query));
}

export function scanSync(query: string): ScanResult {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  
  const queryPtr = stringToPtr(query);
  const resultPtr = wasmModule._wasm_scan(queryPtr);
  wasmModule._free(queryPtr);
  
  const resultStr = ptrToString(resultPtr);
  wasmModule._wasm_free_string(resultPtr);
  
  const result = JSON.parse(resultStr);
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result;
}
