import { ParseResult } from "@pgsql/types";
export * from "@pgsql/types";

// @ts-ignore
import PgQueryModule from './libpg-query-parse-only.js';

interface WasmModule {
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  _wasm_free_string: (ptr: number) => void;
  _wasm_parse_query: (queryPtr: number) => number;
  lengthBytesUTF8: (str: string) => number;
  stringToUTF8: (str: string, ptr: number, len: number) => void;
  UTF8ToString: (ptr: number) => string;
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
  const queryPtr = stringToPtr(query);
  let resultPtr = 0;
  
  try {
    resultPtr = wasmModule._wasm_parse_query(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
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

export function parseSync(query: string): ParseResult {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  const queryPtr = stringToPtr(query);
  let resultPtr = 0;
  
  try {
    resultPtr = wasmModule._wasm_parse_query(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
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
