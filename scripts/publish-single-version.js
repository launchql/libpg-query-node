#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const pkgPath = path.join(process.cwd(), 'package.json');

if (!fs.existsSync(pkgPath)) {
  console.error('❌ No package.json found in current directory.');
  process.exit(1);
}

const originalText = fs.readFileSync(pkgPath, 'utf8');
const original = JSON.parse(originalText);
const publishMeta = original['x-publish'] || {};

const publishName = publishMeta.publishName || 'libpg-query';
const distTag = process.env.TAG || publishMeta.distTag || 'latest';

if (!original.name || !original.version) {
  console.error('❌ package.json must include name and version');
  process.exit(1);
}

// Hashes of the Emscripten outputs, so anyone can rebuild from the x-publish pins and compare.
const wasmSha256 = {};
for (const file of ['wasm/libpg-query.wasm', 'wasm/libpg-query.js']) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${file} not found; build this version first.`);
    process.exit(1);
  }
  wasmSha256[file] = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

const modified = {
  ...original,
  name: publishName,
  'x-publish': { ...publishMeta, wasmSha256 }
};

try {
  console.log(`📦 Publishing ${publishName}@${original.version} with tag '${distTag}'...`);
  fs.writeFileSync(pkgPath, JSON.stringify(modified, null, 2));
  // npm OK here since it's version, not dist/ package...
  execSync(`npm publish --tag ${distTag}`, { stdio: 'inherit' });
  console.log('✅ Publish complete.');
} catch (err) {
  console.error('❌ Publish failed:', err.message);
  process.exitCode = 1;
} finally {
  fs.writeFileSync(pkgPath, originalText);
  console.log('🔄 Restored original package.json');
}
