const PgQueryModule = require('./libpg-query.js');

let wasmModule;

const initPromise = PgQueryModule.default().then((module) => {
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

const protobufCache = new WeakMap();

const parseQuery = awaitInit(async (query) => {
  const queryPtr = stringToPtr(query);
  let resultPtr;
  let protobufPtr;
  
  try {
    resultPtr = wasmModule._wasm_parse_query(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
      throw new Error(resultStr);
    }
    
    const parseResult = JSON.parse(resultStr);
    
    const protobufLen = wasmModule._wasm_get_protobuf_len(queryPtr);
    if (protobufLen > 0) {
      const lenPtr = wasmModule._malloc(4);
      wasmModule.HEAPU32[lenPtr >> 2] = 0;
      protobufPtr = wasmModule._wasm_parse_query_protobuf(queryPtr, lenPtr);
      const actualLen = wasmModule.HEAPU32[lenPtr >> 2];
      wasmModule._free(lenPtr);
      
      if (actualLen > 0) {
        const protobufData = new Uint8Array(wasmModule.HEAPU8.buffer, protobufPtr, actualLen);
        const protobufCopy = new Uint8Array(protobufData);
        protobufCache.set(parseResult, protobufCopy);
      }
    }
    
    return parseResult;
  } finally {
    wasmModule._free(queryPtr);
    if (resultPtr) {
      wasmModule._wasm_free_string(resultPtr);
    }
    if (protobufPtr) {
      wasmModule._wasm_free_string(protobufPtr);
    }
  }
});

const deparse = awaitInit(async (parseTree) => {
  const protobufData = protobufCache.get(parseTree);
  
  if (!protobufData) {
    throw new Error('deparse error: No protobuf data found for parse tree. Make sure to use the result from parseQuery directly.');
  }
  
  const dataPtr = wasmModule._malloc(protobufData.length);
  let resultPtr;
  
  try {
    wasmModule.HEAPU8.set(protobufData, dataPtr);
    resultPtr = wasmModule._wasm_deparse_protobuf(dataPtr, protobufData.length);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
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

const parsePlPgSQL = awaitInit(async (query) => {
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

const fingerprint = awaitInit(async (query) => {
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

const normalize = awaitInit(async (query) => {
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



const parseQueryDetailed = awaitInit(async (query) => {
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

// Sync versions that assume WASM module is already initialized
function parseQuerySync(query) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call an async method first to initialize.');
  }
  const queryPtr = stringToPtr(query);
  let resultPtr;
  let protobufPtr;
  
  try {
    resultPtr = wasmModule._wasm_parse_query(queryPtr);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
      throw new Error(resultStr);
    }
    
    const parseResult = JSON.parse(resultStr);
    
    const protobufLen = wasmModule._wasm_get_protobuf_len(queryPtr);
    if (protobufLen > 0) {
      const lenPtr = wasmModule._malloc(4);
      wasmModule.HEAPU32[lenPtr >> 2] = 0;
      protobufPtr = wasmModule._wasm_parse_query_protobuf(queryPtr, lenPtr);
      const actualLen = wasmModule.HEAPU32[lenPtr >> 2];
      wasmModule._free(lenPtr);
      
      if (actualLen > 0) {
        const protobufData = new Uint8Array(wasmModule.HEAPU8.buffer, protobufPtr, actualLen);
        const protobufCopy = new Uint8Array(protobufData);
        protobufCache.set(parseResult, protobufCopy);
      }
    }
    
    return parseResult;
  } finally {
    wasmModule._free(queryPtr);
    if (resultPtr) {
      wasmModule._wasm_free_string(resultPtr);
    }
    if (protobufPtr) {
      wasmModule._wasm_free_string(protobufPtr);
    }
  }
}

function deparseSync(parseTree) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call an async method first to initialize.');
  }
  const protobufData = protobufCache.get(parseTree);
  
  if (!protobufData) {
    throw new Error('deparse error: No protobuf data found for parse tree. Make sure to use the result from parseQuery directly.');
  }
  
  const dataPtr = wasmModule._malloc(protobufData.length);
  let resultPtr;
  
  try {
    wasmModule.HEAPU8.set(protobufData, dataPtr);
    resultPtr = wasmModule._wasm_deparse_protobuf(dataPtr, protobufData.length);
    const resultStr = ptrToString(resultPtr);
    
    if (resultStr.startsWith('syntax error') || resultStr.startsWith('deparse error') || resultStr.includes('ERROR')) {
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

function parsePlPgSQLSync(query) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call an async method first to initialize.');
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

function fingerprintSync(query) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call an async method first to initialize.');
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

function normalizeSync(query) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call an async method first to initialize.');
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



module.exports = {
  parseQuery,
  deparse,
  parsePlPgSQL,
  fingerprint,
  normalize,
  parseQueryDetailed,
  parseQuerySync,
  deparseSync,
  parsePlPgSQLSync,
  fingerprintSync,
  normalizeSync,
  initPromise
};
