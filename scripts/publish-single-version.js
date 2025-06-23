#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pkgPath = path.join(process.cwd(), 'package.json');

if (!fs.existsSync(pkgPath)) {
  console.error('❌ No package.json found in current directory.');
  process.exit(1);
}

const original = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const publishMeta = original['x-publish'] || {};

const publishName = publishMeta.publishName || 'libpg-query';
const distTag = process.env.TAG || publishMeta.distTag || 'latest';

if (!original.name || !original.version) {
  console.error('❌ package.json must include name and version');
  process.exit(1);
}

const modified = { ...original, name: publishName };

try {
  console.log(`📦 Publishing ${publishName}@${original.version} with tag '${distTag}'...`);
  fs.writeFileSync(pkgPath, JSON.stringify(modified, null, 2));
  // npm OK here since it's version, not dist/ package...
  execSync(`npm publish --tag ${distTag}`, { stdio: 'inherit' });
  console.log('✅ Publish complete.');
} catch (err) {
  console.error('❌ Publish failed:', err.message);
} finally {
  fs.writeFileSync(pkgPath, JSON.stringify(original, null, 2));
  console.log('🔄 Restored original package.json');
}
