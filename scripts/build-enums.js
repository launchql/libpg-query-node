#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get all enums directories
function getEnumsDirectories() {
  const enumsDir = path.join(__dirname, '..', 'enums');
  if (!fs.existsSync(enumsDir)) {
    console.log('No enums directory found');
    return [];
  }
  
  return fs.readdirSync(enumsDir)
    .filter(dir => {
      const fullPath = path.join(enumsDir, dir);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort();
}

// Build a single enums package
function buildEnumsPackage(version) {
  const packagePath = path.join(__dirname, '..', 'enums', version);
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  Skipping enums/${version} - no package.json found`);
    return false;
  }
  
  console.log(`🔨 Building enums/${version}...`);
  
  try {
    // First run build:proto to generate enums from protobuf
    console.log(`  📋 Running build:proto for enums/${version}...`);
    execSync('pnpm run build:proto', { 
      cwd: packagePath, 
      stdio: 'inherit' 
    });
    
    // Then run the main build command
    console.log(`  🏗️  Running build for enums/${version}...`);
    execSync('pnpm run build', { 
      cwd: packagePath, 
      stdio: 'inherit' 
    });
    
    console.log(`✅ Successfully built enums/${version}\n`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to build enums/${version}: ${error.message}\n`);
    return false;
  }
}

// Main function
function buildAllEnums() {
  const enumsDirectories = getEnumsDirectories();
  
  if (enumsDirectories.length === 0) {
    console.log('No enums packages found to build');
    return;
  }
  
  console.log(`Found ${enumsDirectories.length} enums packages: ${enumsDirectories.join(', ')}\n`);
  
  let successful = 0;
  let failed = 0;
  
  for (const version of enumsDirectories) {
    if (buildEnumsPackage(version)) {
      successful++;
    } else {
      failed++;
    }
  }
  
  console.log('='.repeat(50));
  console.log(`Build Summary:`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total packages: ${enumsDirectories.length}`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  buildAllEnums();
}

module.exports = { buildAllEnums, buildEnumsPackage, getEnumsDirectories };