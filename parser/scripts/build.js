const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run TypeScript compilation
console.log('Compiling TypeScript...');
const tscPath = path.join(__dirname, '../node_modules/.bin/tsc');
execSync(`${tscPath}`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
execSync(`${tscPath} -p tsconfig.esm.json`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });

// Rename files to have correct extensions
const wasmDir = path.join(__dirname, '../wasm');
const cjsDir = path.join(__dirname, '../cjs');
const esmDir = path.join(__dirname, '../esm');

// Ensure wasm directory exists
if (!fs.existsSync(wasmDir)) {
  fs.mkdirSync(wasmDir, { recursive: true });
}

// Function to rename and move files
function moveFile(from, to) {
  if (fs.existsSync(from)) {
    fs.renameSync(from, to);
  }
}

// Move main index files
moveFile(path.join(cjsDir, 'index.js'), path.join(wasmDir, 'index.cjs'));
moveFile(path.join(esmDir, 'index.js'), path.join(wasmDir, 'index.js'));
moveFile(path.join(cjsDir, 'index.d.ts'), path.join(wasmDir, 'index.d.ts'));

// Move version-specific files
['v15', 'v16', 'v17'].forEach(version => {
  moveFile(path.join(cjsDir, `${version}.js`), path.join(wasmDir, `${version}.cjs`));
  moveFile(path.join(esmDir, `${version}.js`), path.join(wasmDir, `${version}.js`));
  moveFile(path.join(cjsDir, `${version}.d.ts`), path.join(wasmDir, `${version}.d.ts`));
});

// Clean up temporary directories
if (fs.existsSync(cjsDir)) {
  fs.rmSync(cjsDir, { recursive: true });
}
if (fs.existsSync(esmDir)) {
  fs.rmSync(esmDir, { recursive: true });
}

console.log('Build completed successfully!');