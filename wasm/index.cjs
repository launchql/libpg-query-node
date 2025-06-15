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

const parseQuery = awaitInit(async (query) => {
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

const deparse = awaitInit(async (parseTree) => {
  throw new Error('deparse function temporarily disabled - proto.js dependency removed');
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

// Sync versions that assume WASM module is already initialized
function parseQuerySync(query) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call an async method first to initialize.');
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

function deparseSync(parseTree) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call an async method first to initialize.');
  }
  throw new Error('deparse function temporarily disabled - proto.js dependency removed');
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

module.exports = {
  parseQuery,
  deparse,
  parsePlPgSQL,
  fingerprint,
  parseQuerySync,
  deparseSync,
  parsePlPgSQLSync,
  fingerprintSync,
  initPromise
};
