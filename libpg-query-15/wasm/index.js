export * from "@pgsql/types";
import PgQueryModule from './libpg-query.js';

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

export const parse = awaitInit(async (query) => {
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

export function parseSync(query) {
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
