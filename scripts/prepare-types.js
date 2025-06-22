#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to prepare types packages for publishing by modifying their dist/package.json
 * to use the correct publishing name and dist-tag from x-publish metadata
 */

function preparePackageForPublish(packageDir) {
  const packageJsonPath = path.join(packageDir, 'package.json');
  const distPackageJsonPath = path.join(packageDir, 'dist', 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`❌ Package.json not found: ${packageJsonPath}`);
    return false;
  }
  
  if (!fs.existsSync(distPackageJsonPath)) {
    console.error(`❌ Dist package.json not found: ${distPackageJsonPath}`);
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const distPackageJson = JSON.parse(fs.readFileSync(distPackageJsonPath, 'utf8'));
    
    if (!packageJson['x-publish']) {
      console.error(`❌ No x-publish metadata found in ${packageDir}`);
      return false;
    }
    
    const { publishName, distTag } = packageJson['x-publish'];
    
    if (!publishName) {
      console.error(`❌ No publishName found in x-publish metadata for ${packageDir}`);
      return false;
    }
    
    // Modify the dist package.json
    distPackageJson.name = publishName;
    
    // Add dist-tag to publishConfig if specified
    if (distTag) {
      if (!distPackageJson.publishConfig) {
        distPackageJson.publishConfig = {};
      }
      distPackageJson.publishConfig.tag = distTag;
    }
    
    // Remove x-publish metadata from the dist version
    delete distPackageJson['x-publish'];
    
    // Write the modified package.json back to dist
    fs.writeFileSync(distPackageJsonPath, JSON.stringify(distPackageJson, null, 2) + '\n');
    
    console.log(`✅ Prepared ${packageDir} for publishing as ${publishName}${distTag ? ` with tag ${distTag}` : ''}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error preparing ${packageDir}: ${error.message}`);
    return false;
  }
}

function main() {
  const typesDir = path.join(__dirname, '..', 'types');
  
  if (!fs.existsSync(typesDir)) {
    console.error('❌ Types directory not found');
    process.exit(1);
  }
  
  const typesPackages = fs.readdirSync(typesDir)
    .filter(dir => fs.statSync(path.join(typesDir, dir)).isDirectory())
    .sort();
  
  console.log(`📦 Found ${typesPackages.length} types packages: ${typesPackages.join(', ')}\n`);
  
  let successCount = 0;
  
  for (const packageName of typesPackages) {
    const packagePath = path.join(typesDir, packageName);
    console.log(`🔧 Preparing types/${packageName}...`);
    
    if (preparePackageForPublish(packagePath)) {
      successCount++;
    }
    console.log('');
  }
  
  console.log('==================================================');
  console.log(`Prepare Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${typesPackages.length - successCount}`);
  console.log(`📦 Total packages: ${typesPackages.length}`);
  
  if (successCount < typesPackages.length) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { preparePackageForPublish };