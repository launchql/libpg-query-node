const wasmModule = require('./wasm/index.cjs');
const deasync = require('deasync');

let initDone = false;
let initError = null;

wasmModule.initPromise.then(() => {
  initDone = true;
}).catch((err) => {
  initError = err;
  initDone = true;
});

deasync.loopWhile(() => !initDone);

if (initError) {
  throw initError;
}

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
