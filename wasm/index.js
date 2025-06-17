export * from "@pgsql/types";
// @ts-ignore
import PgQueryModule from './libpg-query.js';
// @ts-ignore
import { pg_query } from '../proto.js';
let wasmModule;
const initPromise = PgQueryModule().then((module) => {
    wasmModule = module;
});
export async function loadModule() {
    if (!wasmModule) {
        await initPromise;
    }
}
function awaitInit(fn) {
    return (async (...args) => {
        await initPromise;
        return fn(...args);
    });
}
function stringToPtr(str) {
    const len = wasmModule.lengthBytesUTF8(str) + 1;
    const ptr = wasmModule._malloc(len);
    try {
        wasmModule.stringToUTF8(str, ptr, len);
        return ptr;
    }
    catch (error) {
        wasmModule._free(ptr);
        throw error;
    }
}
function ptrToString(ptr) {
    return wasmModule.UTF8ToString(ptr);
}
export const parseQuery = awaitInit(async (query) => {
    const queryPtr = stringToPtr(query);
    let resultPtr = 0;
    try {
        resultPtr = wasmModule._wasm_parse_query(queryPtr);
        const resultStr = ptrToString(resultPtr);
        if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
            throw new Error(resultStr);
        }
        return JSON.parse(resultStr);
    }
    finally {
        wasmModule._free(queryPtr);
        if (resultPtr) {
            wasmModule._wasm_free_string(resultPtr);
        }
    }
});
export const deparse = awaitInit(async (parseTree) => {
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
        if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
            throw new Error(resultStr);
        }
        return resultStr;
    }
    finally {
        wasmModule._free(dataPtr);
        if (resultPtr) {
            wasmModule._wasm_free_string(resultPtr);
        }
    }
});
export const parsePlPgSQL = awaitInit(async (query) => {
    const queryPtr = stringToPtr(query);
    let resultPtr = 0;
    try {
        resultPtr = wasmModule._wasm_parse_plpgsql(queryPtr);
        const resultStr = ptrToString(resultPtr);
        if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
            throw new Error(resultStr);
        }
        return JSON.parse(resultStr);
    }
    finally {
        wasmModule._free(queryPtr);
        if (resultPtr) {
            wasmModule._wasm_free_string(resultPtr);
        }
    }
});
export const fingerprint = awaitInit(async (query) => {
    const queryPtr = stringToPtr(query);
    let resultPtr = 0;
    try {
        resultPtr = wasmModule._wasm_fingerprint(queryPtr);
        const resultStr = ptrToString(resultPtr);
        if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
            throw new Error(resultStr);
        }
        return resultStr;
    }
    finally {
        wasmModule._free(queryPtr);
        if (resultPtr) {
            wasmModule._wasm_free_string(resultPtr);
        }
    }
});
export const normalize = awaitInit(async (query) => {
    const queryPtr = stringToPtr(query);
    let resultPtr = 0;
    try {
        resultPtr = wasmModule._wasm_normalize_query(queryPtr);
        const resultStr = ptrToString(resultPtr);
        if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
            throw new Error(resultStr);
        }
        return resultStr;
    }
    finally {
        wasmModule._free(queryPtr);
        if (resultPtr) {
            wasmModule._wasm_free_string(resultPtr);
        }
    }
});
// Sync versions
export function parseQuerySync(query) {
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
    }
    finally {
        wasmModule._free(queryPtr);
        if (resultPtr) {
            wasmModule._wasm_free_string(resultPtr);
        }
    }
}
export function deparseSync(parseTree) {
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
        if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
            throw new Error(resultStr);
        }
        return resultStr;
    }
    finally {
        wasmModule._free(dataPtr);
        if (resultPtr) {
            wasmModule._wasm_free_string(resultPtr);
        }
    }
}
export function parsePlPgSQLSync(query) {
    if (!wasmModule) {
        throw new Error('WASM module not initialized. Call loadModule() first.');
    }
    const queryPtr = stringToPtr(query);
    let resultPtr = 0;
    try {
        resultPtr = wasmModule._wasm_parse_plpgsql(queryPtr);
        const resultStr = ptrToString(resultPtr);
        if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
            throw new Error(resultStr);
        }
        return JSON.parse(resultStr);
    }
    finally {
        wasmModule._free(queryPtr);
        if (resultPtr) {
            wasmModule._wasm_free_string(resultPtr);
        }
    }
}
export function fingerprintSync(query) {
    if (!wasmModule) {
        throw new Error('WASM module not initialized. Call loadModule() first.');
    }
    const queryPtr = stringToPtr(query);
    let resultPtr = 0;
    try {
        resultPtr = wasmModule._wasm_fingerprint(queryPtr);
        const resultStr = ptrToString(resultPtr);
        if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
            throw new Error(resultStr);
        }
        return resultStr;
    }
    finally {
        wasmModule._free(queryPtr);
        if (resultPtr) {
            wasmModule._wasm_free_string(resultPtr);
        }
    }
}
export function normalizeSync(query) {
    if (!wasmModule) {
        throw new Error('WASM module not initialized. Call loadModule() first.');
    }
    const queryPtr = stringToPtr(query);
    let resultPtr = 0;
    try {
        resultPtr = wasmModule._wasm_normalize_query(queryPtr);
        const resultStr = ptrToString(resultPtr);
        if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
            throw new Error(resultStr);
        }
        return resultStr;
    }
    finally {
        wasmModule._free(queryPtr);
        if (resultPtr) {
            wasmModule._wasm_free_string(resultPtr);
        }
    }
}
