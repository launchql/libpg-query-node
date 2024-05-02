const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');

if (typeof process.argv[2] !== 'string') {
    throw new Error('branchName not provided');
}

// Configuration Variables
const branchName = process.argv[2];
const protoUrl = `https://raw.githubusercontent.com/pganalyze/libpg_query/${branchName}/protobuf/pg_query.proto`;
const protoFilePath = 'libpg_query/protobuf/pg_query.proto';
const protoJSFilePath = 'proto.js';
const originalPackageName = 'protobufjs/minimal';
const newPackageName = '@pgsql/protobufjs/minimal';
const pbjsCommand = ['pbjs', '--keep-case', '-t', 'static-module', '-o', protoJSFilePath, protoFilePath];

// Step 1: Download the .proto file
function downloadProtoFile(callback) {
  https.get(protoUrl, (response) => {
    if (response.statusCode !== 200) {
      console.error(`Failed to download file: Status Code: ${response.statusCode}`);
      response.resume(); // consume response data to free up memory
      return;
    }
    
    const fileStream = fs.createWriteStream(protoFilePath);
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log('Downloaded proto file.');
      callback();
    });
  }).on('error', (err) => {
    console.error(`Error downloading the file: ${err.message}`);
    fs.unlink(protoFilePath, () => {}); // Delete the file async. (No need to check error here)
  });
}

// Step 2: Generate proto.js using pbjs (Assuming pbjs is installed and accessible)
function generateProtoJS(callback) {
  exec(pbjsCommand.join(' '), (error, stdout, stderr) => {
    if (error) {
      console.error(`Error during code generation: ${error.message}`);
      return;
    }
    console.log('Generated proto.js from proto file.');
    callback();
  });
}

// Step 3: Replace text in proto.js
function replaceTextInProtoJS() {
  fs.readFile(protoJSFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading proto.js: ${err.message}`);
      return;
    }
    
    const result = data.replace(new RegExp(originalPackageName, 'g'), newPackageName);
    
    fs.writeFile(protoJSFilePath, result, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing back to proto.js: ${err.message}`);
        return;
      }
      console.log('Replaced text in proto.js successfully.');
    });
  });
}

// Execute all steps
downloadProtoFile(() => {
  generateProtoJS(() => {
    replaceTextInProtoJS();
  });
});
