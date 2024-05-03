const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');

if (typeof process.argv[2] !== 'string') {
    throw new Error('branchName not provided');
}

// Configuration Variables
const branchName = process.argv[2];
const protoUrl = `https://raw.githubusercontent.com/pganalyze/libpg_query/${branchName}/protobuf/pg_query.proto`;
const inFile = 'libpg_query/protobuf/pg_query.proto';
const outFile = 'proto.js';

const protogenCmd = [
  'pg-proto-parser',
  'protogen',
  '--protoUrl',
  protoUrl,
  '--inFile',
  inFile,
  '--outFile',
  outFile,
  '--originalPackageName',
  'protobufjs/minimal',
  '--newPackageName',
  '@launchql/protobufjs/minimal'
];

// Step 2: Generate proto.js using pbjs (Assuming pbjs is installed and accessible)
function generateProtoJS(callback) {
  exec(protogenCmd.join(' '), (error, stdout, stderr) => {
    if (error) {
      console.error(`Error during code generation: ${error.message}`);
      return;
    }
    console.log('Generated proto.js from proto file.');
    callback();
  });
}

  generateProtoJS(() => {
    console.log('all done 🎉');
  });
