#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get all types directories
function getTypesDirectories() {
  const typesDir = path.join(__dirname, '..', 'types');
  if (!fs.existsSync(typesDir)) {
    console.log('No types directory found');
    return [];
  }
  
  return fs.readdirSync(typesDir)
    .filter(dir => {
      const fullPath = path.join(typesDir, dir);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort();
}

// Build a single types package
function buildTypesPackage(version) {
  const packagePath = path.join(__dirname, '..', 'types', version);
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  Skipping types/${version} - no package.json found`);
    return false;
  }
  
  console.log(`🔨 Building types/${version}...`);
  
  try {
    // First run build:proto to generate types from protobuf
    console.log(`  📋 Running build:proto for types/${version}...`);
    execSync('pnpm run build:proto', { 
      cwd: packagePath, 
      stdio: 'inherit' 
    });
    
    // Then run the main build command
    console.log(`  🏗️  Running build for types/${version}...`);
    execSync('pnpm run build', { 
      cwd: packagePath, 
      stdio: 'inherit' 
    });
    
    console.log(`✅ Successfully built types/${version}\n`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to build types/${version}: ${error.message}\n`);
    return false;
  }
}

// Main function
function buildAllTypes() {
  const typesDirectories = getTypesDirectories();
  
  if (typesDirectories.length === 0) {
    console.log('No types packages found to build');
    return;
  }
  
  console.log(`Found ${typesDirectories.length} types packages: ${typesDirectories.join(', ')}\n`);
  
  let successful = 0;
  let failed = 0;
  
  for (const version of typesDirectories) {
    if (buildTypesPackage(version)) {
      successful++;
    } else {
      failed++;
    }
  }
  
  console.log('='.repeat(50));
  console.log(`Build Summary:`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total packages: ${typesDirectories.length}`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  buildAllTypes();
}

module.exports = { buildAllTypes, buildTypesPackage, getTypesDirectories };