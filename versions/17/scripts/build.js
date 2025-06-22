const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// First, copy the simplified index to index.ts
const srcDir = path.join(__dirname, '../src');
fs.copyFileSync(
  path.join(srcDir, 'index-simplified.ts'),
  path.join(srcDir, 'index.ts')
);

// Run TypeScript compilation
console.log('Compiling TypeScript...');
execSync('tsc', { stdio: 'inherit' });
execSync('tsc -p tsconfig.esm.json', { stdio: 'inherit' });

// Rename files to have correct extensions
const wasmDir = path.join(__dirname, '../wasm');
const cjsDir = path.join(__dirname, '../cjs');
const esmDir = path.join(__dirname, '../esm');

// Rename CommonJS files
fs.renameSync(
  path.join(cjsDir, 'index.js'),
  path.join(wasmDir, 'index.cjs')
);

// Rename ESM files
fs.renameSync(
  path.join(esmDir, 'index.js'),
  path.join(wasmDir, 'index.js')
);

// Rename declaration files
fs.renameSync(
  path.join(cjsDir, 'index.d.ts'),
  path.join(wasmDir, 'index.d.ts')
);

console.log('Build completed successfully!'); 