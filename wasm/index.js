import PgQueryModule from './libpg-query.js';

let wasmModule;

const initPromise = PgQueryModule().then((module) => {
  wasmModule = module;
});

export async function loadModule() {
  if (!wasmModule) {
    await initPromise;
  }
  return wasmModule;
}

function awaitInit(fn) {
  return async (...args) => {
    await initPromise;
    return fn(...args);
  };
}

function stringToPtr(str) {
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

function ptrToString(ptr) {
  return wasmModule.UTF8ToString(ptr);
}

export const parseQuery = awaitInit(async (query) => {
  const queryPtr = stringToPtr(query);
  let resultPtr;
  
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

export const deparse = awaitInit(async (parseTree) => {
  const queryPtr = stringToPtr(JSON.stringify(parseTree));
  let resultPtr;
  
  try {
    resultPtr = wasmModule._wasm_deparse_protobuf(queryPtr, 0);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
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

export const parsePlPgSQL = awaitInit(async (query) => {
  const queryPtr = stringToPtr(query);
  let resultPtr;
  
  try {
    resultPtr = wasmModule._wasm_parse_plpgsql(queryPtr);
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

export const fingerprint = awaitInit(async (query) => {
  const queryPtr = stringToPtr(query);
  let resultPtr;
  
  try {
    resultPtr = wasmModule._wasm_fingerprint(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
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

export const normalize = awaitInit(async (query) => {
  const queryPtr = stringToPtr(query);
  let resultPtr;
  
  try {
    resultPtr = wasmModule._wasm_normalize_query(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
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

export const parseQueryDetailed = awaitInit(async (query) => {
  const queryPtr = stringToPtr(query);
  let resultPtr;
  
  try {
    resultPtr = wasmModule._wasm_parse_query_detailed(queryPtr);
    
    const hasError = wasmModule.HEAPU32[resultPtr >> 2];
    
    if (hasError) {
      const messagePtr = wasmModule.HEAPU32[(resultPtr + 4) >> 2];
      const funcnamePtr = wasmModule.HEAPU32[(resultPtr + 8) >> 2];
      const filenamePtr = wasmModule.HEAPU32[(resultPtr + 12) >> 2];
      const lineno = wasmModule.HEAPU32[(resultPtr + 16) >> 2];
      const cursorpos = wasmModule.HEAPU32[(resultPtr + 20) >> 2];
      const contextPtr = wasmModule.HEAPU32[(resultPtr + 24) >> 2];
      
      const error = {
        message: messagePtr ? ptrToString(messagePtr) : '',
        funcname: funcnamePtr ? ptrToString(funcnamePtr) : null,
        filename: filenamePtr ? ptrToString(filenamePtr) : null,
        lineno: lineno,
        cursorpos: cursorpos,
        context: contextPtr ? ptrToString(contextPtr) : null
      };
      
      wasmModule._wasm_free_detailed_result(resultPtr);
      throw new Error(error.message);
    } else {
      const dataPtr = wasmModule.HEAPU32[(resultPtr + 28) >> 2];
      const result = JSON.parse(ptrToString(dataPtr));
      wasmModule._wasm_free_detailed_result(resultPtr);
      return result;
    }
  } finally {
    wasmModule._free(queryPtr);
  }
});

// Sync versions
export function parseQuerySync(query) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  const queryPtr = stringToPtr(query);
  let resultPtr;
  
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

export function deparseSync(parseTree) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  const queryPtr = stringToPtr(JSON.stringify(parseTree));
  let resultPtr;
  
  try {
    resultPtr = wasmModule._wasm_deparse_protobuf(queryPtr, 0);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
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

export function parsePlPgSQLSync(query) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  const queryPtr = stringToPtr(query);
  let resultPtr;
  
  try {
    resultPtr = wasmModule._wasm_parse_plpgsql(queryPtr);
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

export function fingerprintSync(query) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  const queryPtr = stringToPtr(query);
  let resultPtr;
  
  try {
    resultPtr = wasmModule._wasm_fingerprint(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
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

export function normalizeSync(query) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  const queryPtr = stringToPtr(query);
  let resultPtr;
  
  try {
    resultPtr = wasmModule._wasm_normalize_query(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
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

export function parseQueryDetailedSync(query) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call loadModule() first.');
  }
  const queryPtr = stringToPtr(query);
  let resultPtr;
  
  try {
    resultPtr = wasmModule._wasm_parse_query_detailed(queryPtr);
    
    const hasError = wasmModule.HEAPU32[resultPtr >> 2];
    
    if (hasError) {
      const messagePtr = wasmModule.HEAPU32[(resultPtr + 4) >> 2];
      const funcnamePtr = wasmModule.HEAPU32[(resultPtr + 8) >> 2];
      const filenamePtr = wasmModule.HEAPU32[(resultPtr + 12) >> 2];
      const lineno = wasmModule.HEAPU32[(resultPtr + 16) >> 2];
      const cursorpos = wasmModule.HEAPU32[(resultPtr + 20) >> 2];
      const contextPtr = wasmModule.HEAPU32[(resultPtr + 24) >> 2];
      
      const error = {
        message: messagePtr ? ptrToString(messagePtr) : '',
        funcname: funcnamePtr ? ptrToString(funcnamePtr) : null,
        filename: filenamePtr ? ptrToString(filenamePtr) : null,
        lineno: lineno,
        cursorpos: cursorpos,
        context: contextPtr ? ptrToString(contextPtr) : null
      };
      
      wasmModule._wasm_free_detailed_result(resultPtr);
      throw new Error(error.message);
    } else {
      const dataPtr = wasmModule.HEAPU32[(resultPtr + 28) >> 2];
      const result = JSON.parse(ptrToString(dataPtr));
      wasmModule._wasm_free_detailed_result(resultPtr);
      return result;
    }
  } finally {
    wasmModule._free(queryPtr);
  }
}
