"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scan = exports.normalize = exports.fingerprint = exports.parsePlPgSQL = exports.deparse = exports.parse = void 0;
exports.loadModule = loadModule;
exports.parseSync = parseSync;
exports.deparseSync = deparseSync;
exports.parsePlPgSQLSync = parsePlPgSQLSync;
exports.fingerprintSync = fingerprintSync;
exports.normalizeSync = normalizeSync;
exports.scanSync = scanSync;
__exportStar(require("@pgsql/types"), exports);
// @ts-ignore
const libpg_query_js_1 = __importDefault(require("./libpg-query.js"));
// @ts-ignore
const proto_js_1 = require("../proto.js");
let wasmModule;
const initPromise = (0, libpg_query_js_1.default)().then((module) => {
    wasmModule = module;
});
async function loadModule() {
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
exports.parse = awaitInit(async (query) => {
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
exports.deparse = awaitInit(async (parseTree) => {
    if (!parseTree || typeof parseTree !== 'object' || !Array.isArray(parseTree.stmts) || parseTree.stmts.length === 0) {
        throw new Error('No parseTree provided');
    }
    const msg = proto_js_1.pg_query.ParseResult.fromObject(parseTree);
    const data = proto_js_1.pg_query.ParseResult.encode(msg).finish();
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
exports.parsePlPgSQL = awaitInit(async (query) => {
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
exports.fingerprint = awaitInit(async (query) => {
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
exports.normalize = awaitInit(async (query) => {
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
function parseSync(query) {
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
function deparseSync(parseTree) {
    if (!wasmModule) {
        throw new Error('WASM module not initialized. Call loadModule() first.');
    }
    if (!parseTree || typeof parseTree !== 'object' || !Array.isArray(parseTree.stmts) || parseTree.stmts.length === 0) {
        throw new Error('No parseTree provided');
    }
    const msg = proto_js_1.pg_query.ParseResult.fromObject(parseTree);
    const data = proto_js_1.pg_query.ParseResult.encode(msg).finish();
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
function parsePlPgSQLSync(query) {
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
function fingerprintSync(query) {
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
function normalizeSync(query) {
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
exports.scan = awaitInit(async (query) => {
    const queryPtr = stringToPtr(query);
    let resultPtr = 0;
    try {
        resultPtr = wasmModule._wasm_scan(queryPtr);
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
function scanSync(query) {
    if (!wasmModule) {
        throw new Error('WASM module not initialized. Call loadModule() first.');
    }
    const queryPtr = stringToPtr(query);
    let resultPtr = 0;
    try {
        resultPtr = wasmModule._wasm_scan(queryPtr);
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
