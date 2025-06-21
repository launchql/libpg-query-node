const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const isParseOnly = fs.existsSync(path.join(__dirname, '../wasm/libpg-query-parse-only.js'));

if (isParseOnly) {
  console.log('Compiling TypeScript for parse-only build...');
  
  const baseTsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../tsconfig.json'), 'utf8'));
  const baseEsmTsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../tsconfig.esm.json'), 'utf8'));
  
  const parseOnlyTsConfig = {
    ...baseTsConfig,
    include: ['src/index-parse-only.ts', 'src/libpg-query.d.ts', 'src/proto.d.ts']
  };
  
  const parseOnlyEsmTsConfig = {
    ...baseEsmTsConfig,
    include: ['src/index-parse-only.ts', 'src/libpg-query.d.ts', 'src/proto.d.ts']
  };
  
  fs.writeFileSync(path.join(__dirname, '../tsconfig.parse-only.json'), JSON.stringify(parseOnlyTsConfig, null, 2));
  fs.writeFileSync(path.join(__dirname, '../tsconfig.parse-only.esm.json'), JSON.stringify(parseOnlyEsmTsConfig, null, 2));
  
  execSync('tsc -p tsconfig.parse-only.json', { stdio: 'inherit' });
  execSync('tsc -p tsconfig.parse-only.esm.json', { stdio: 'inherit' });
  
  fs.unlinkSync(path.join(__dirname, '../tsconfig.parse-only.json'));
  fs.unlinkSync(path.join(__dirname, '../tsconfig.parse-only.esm.json'));
} else {
  // Run TypeScript compilation
  console.log('Compiling TypeScript...');
  execSync('tsc', { stdio: 'inherit' });
  execSync('tsc -p tsconfig.esm.json', { stdio: 'inherit' });
}

// Rename files to have correct extensions
const wasmDir = path.join(__dirname, '../wasm');
const cjsDir = path.join(__dirname, '../cjs');
const esmDir = path.join(__dirname, '../esm');

if (isParseOnly) {
  const cjsFile = path.join(cjsDir, 'index-parse-only.js');
  const esmFile = path.join(esmDir, 'index-parse-only.js');
  const dtsFile = path.join(cjsDir, 'index-parse-only.d.ts');
  
  if (fs.existsSync(cjsFile)) {
    fs.renameSync(cjsFile, path.join(wasmDir, 'index.cjs'));
  }
  
  if (fs.existsSync(esmFile)) {
    fs.renameSync(esmFile, path.join(wasmDir, 'index.js'));
  }
  
  if (fs.existsSync(dtsFile)) {
    fs.renameSync(dtsFile, path.join(wasmDir, 'index.d.ts'));
  }
} else {
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
}

console.log('Build completed successfully!');  