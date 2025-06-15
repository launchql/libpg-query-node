const wasmModule = require('./wasm/index.cjs');


function parseQuerySync(query) {
  return wasmModule.parseQuerySync(query);
}

function deparseSync(parseTree) {
  return wasmModule.deparseSync(parseTree);
}

function parsePlPgSQLSync(query) {
  return wasmModule.parsePlPgSQLSync(query);
}

function fingerprintSync(query) {
  return wasmModule.fingerprintSync(query);
}

function normalizeSync(query) {
  return wasmModule.normalizeSync(query);
}

function scanSync(query) {
  return wasmModule.scanSync(query);
}

function splitSync(query) {
  return wasmModule.splitSync(query);
}

module.exports = {
  parseQuery: wasmModule.parseQuery,
  deparse: wasmModule.deparse,
  parsePlPgSQL: wasmModule.parsePlPgSQL,
  fingerprint: wasmModule.fingerprint,
  normalize: wasmModule.normalize,
  scan: wasmModule.scan,
  split: wasmModule.split,
  parseQueryDetailed: wasmModule.parseQueryDetailed,
  
  parseQuerySync,
  deparseSync,
  parsePlPgSQLSync,
  fingerprintSync,
  normalizeSync,
  scanSync,
  splitSync
};
