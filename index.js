const wasmModule = require('./wasm/index.cjs');

module.exports = {
  parseQuery: wasmModule.parseQuery,
  deparse: wasmModule.deparse,
  parsePlPgSQL: wasmModule.parsePlPgSQL,
  fingerprint: wasmModule.fingerprint,
  
  parseQuerySync(query) {
    throw new Error('Sync methods not available in WASM-only build. Use async methods instead.');
  },

  deparseSync(parseTree) {
    throw new Error('Sync methods not available in WASM-only build. Use async methods instead.');
  },

  parsePlPgSQLSync(query) {
    throw new Error('Sync methods not available in WASM-only build. Use async methods instead.');
  },

  fingerprintSync(query) {
    throw new Error('Sync methods not available in WASM-only build. Use async methods instead.');
  }
};
