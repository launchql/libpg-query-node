import { pg_query } from '../proto.js';
import PgQueryModule from './libpg-query.js';

let wasmModule;

const initPromise = PgQueryModule().then((module) => {
  wasmModule = module;
});

function awaitInit(fn) {
  return async (...args) => {
    await initPromise;
    return fn(...args);
  };
}

function stringToPtr(str) {
  const len = wasmModule.lengthBytesUTF8(str) + 1;
  const ptr = wasmModule._malloc(len);
  wasmModule.stringToUTF8(str, ptr, len);
  return ptr;
}

function ptrToString(ptr) {
  return wasmModule.UTF8ToString(ptr);
}

export const parseQuery = awaitInit(async (query) => {
  const queryPtr = stringToPtr(query);
  const resultPtr = wasmModule._wasm_parse_query(queryPtr);
  wasmModule._free(queryPtr);
  
  const resultStr = ptrToString(resultPtr);
  wasmModule._wasm_free_string(resultPtr);
  
  if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
    throw new Error(resultStr);
  }
  
  return JSON.parse(resultStr);
});

export const deparse = awaitInit(async (parseTree) => {
  const msg = pg_query.ParseResult.fromObject(parseTree);
  const data = pg_query.ParseResult.encode(msg).finish();
  
  const dataPtr = wasmModule._malloc(data.length);
  wasmModule.HEAPU8.set(data, dataPtr);
  
  const resultPtr = wasmModule._wasm_deparse_protobuf(dataPtr, data.length);
  wasmModule._free(dataPtr);
  
  const resultStr = ptrToString(resultPtr);
  wasmModule._wasm_free_string(resultPtr);
  
  if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
    throw new Error(resultStr);
  }
  
  return resultStr;
});

export const parsePlPgSQL = awaitInit(async (query) => {
  const queryPtr = stringToPtr(query);
  const resultPtr = wasmModule._wasm_parse_plpgsql(queryPtr);
  wasmModule._free(queryPtr);
  
  const resultStr = ptrToString(resultPtr);
  wasmModule._wasm_free_string(resultPtr);
  
  if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
    throw new Error(resultStr);
  }
  
  return JSON.parse(resultStr);
});

export const fingerprint = awaitInit(async (query) => {
  const queryPtr = stringToPtr(query);
  const resultPtr = wasmModule._wasm_fingerprint(queryPtr);
  wasmModule._free(queryPtr);
  
  const resultStr = ptrToString(resultPtr);
  wasmModule._wasm_free_string(resultPtr);
  
  if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
    throw new Error(resultStr);
  }
  
  return resultStr;
});
