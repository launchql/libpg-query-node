const wasmModule = require('./wasm/index.cjs');
const deasync = require('deasync');

let initComplete = false;
wasmModule.initPromise.then(() => {
  initComplete = true;
}).catch(() => {
  initComplete = true;
});

function ensureInit() {
  deasync.loopWhile(() => !initComplete);
}

function parseQuerySync(query) {
  ensureInit();
  return wasmModule.parseQuerySync(query);
}

function deparseSync(parseTree) {
  ensureInit();
  return wasmModule.deparseSync(parseTree);
}

function parsePlPgSQLSync(query) {
  ensureInit();
  return wasmModule.parsePlPgSQLSync(query);
}

function fingerprintSync(query) {
  ensureInit();
  return wasmModule.fingerprintSync(query);
}

module.exports = {
  parseQuery: wasmModule.parseQuery,
  deparse: wasmModule.deparse,
  parsePlPgSQL: wasmModule.parsePlPgSQL,
  fingerprint: wasmModule.fingerprint,
  
  parseQuerySync,
  deparseSync,
  parsePlPgSQLSync,
  fingerprintSync
};
