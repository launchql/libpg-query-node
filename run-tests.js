const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, 'package.json');
const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const pgEnv = package.libpgQueryConfig.PGENV;

// Construct the Mocha command
const testCommand = `mocha --timeout 5000 "test/${pgEnv}.test.js"`;

console.log(`Running tests: ${pgEnv}`);
console.log(`Executing: ${testCommand}`);

// Execute the Mocha command
exec(testCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
});
