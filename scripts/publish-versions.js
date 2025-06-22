const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getVersionPackages() {
  const versionsDir = './versions';
  const packages = [];

  if (fs.existsSync(versionsDir)) {
    const versions = fs.readdirSync(versionsDir)
      .filter(dir => fs.statSync(path.join(versionsDir, dir)).isDirectory())
      .sort((a, b) => parseInt(a) - parseInt(b));

    versions.forEach(version => {
      const packageJsonPath = path.join(versionsDir, version, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packages.push({
          path: path.join(versionsDir, version),
          packageJsonPath: packageJsonPath,
          originalName: packageJson.name,
          version: version,
          majorVersion: `${version}.0.0`
        });
      }
    });
  }

  return packages;
}

function backupPackageJson(packagePath) {
  const backupPath = packagePath + '.backup';
  fs.copyFileSync(packagePath, backupPath);
  return backupPath;
}

function restorePackageJson(packagePath) {
  const backupPath = packagePath + '.backup';
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, packagePath);
    fs.unlinkSync(backupPath);
  }
}

function modifyPackageJsonForPublishing(packagePath, version) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  packageJson.name = 'libpg-query';
  
  packageJson.version = `${version}.0.0`;
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  
  return packageJson;
}

function publishPackage(packageInfo, dryRun = false) {
  const { path: packagePath, packageJsonPath, version } = packageInfo;
  const distTag = `pg${version}`;
  
  console.log(`\n📦 Publishing ${packageInfo.originalName} as libpg-query@${distTag}`);
  
  if (dryRun) {
    console.log(`   [DRY RUN] Would run: cd ${packagePath} && pnpm publish --tag ${distTag}`);
    return;
  }
  
  let backupPath;
  try {
    backupPath = backupPackageJson(packageJsonPath);
    
    modifyPackageJsonForPublishing(packageJsonPath, version);
    
    console.log(`   Building package...`);
    execSync('pnpm build', { cwd: packagePath, stdio: 'inherit' });
    
    console.log(`   Publishing with tag ${distTag}...`);
    execSync(`pnpm publish --tag ${distTag}`, { cwd: packagePath, stdio: 'inherit' });
    
    console.log(`   ✅ Successfully published libpg-query@${distTag}`);
    
  } catch (error) {
    console.error(`   ❌ Failed to publish ${packageInfo.originalName}:`, error.message);
    throw error;
  } finally {
    if (backupPath) {
      restorePackageJson(packageJsonPath);
    }
  }
}

function publishAllVersions(options = {}) {
  const { dryRun = false, versions = [] } = options;
  
  console.log('🚀 libpg-query Multi-Version Publisher');
  console.log('=====================================');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No actual publishing will occur\n');
  }
  
  const packages = getVersionPackages();
  
  const packagesToPublish = versions.length > 0 
    ? packages.filter(pkg => versions.includes(pkg.version))
    : packages;
  
  if (packagesToPublish.length === 0) {
    console.log('❌ No packages found to publish');
    return;
  }
  
  console.log(`Found ${packagesToPublish.length} packages to publish:`);
  packagesToPublish.forEach(pkg => {
    console.log(`  - ${pkg.originalName} (v${pkg.version}) -> libpg-query@pg${pkg.version}`);
  });
  
  if (!dryRun) {
    console.log('\n⚠️  This will publish to npm registry. Continue? (Press Ctrl+C to cancel)');
    execSync('sleep 5');
  }
  
  let publishedCount = 0;
  let failedCount = 0;
  
  for (const packageInfo of packagesToPublish) {
    try {
      publishPackage(packageInfo, dryRun);
      publishedCount++;
    } catch (error) {
      failedCount++;
      console.error(`Failed to publish ${packageInfo.originalName}`);
    }
  }
  
  console.log('\n📊 Publishing Summary');
  console.log('====================');
  console.log(`✅ Successfully published: ${publishedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  
  if (!dryRun && publishedCount > 0) {
    console.log('\n🎉 Publishing complete! You can now install with:');
    packagesToPublish.forEach(pkg => {
      console.log(`   npm install libpg-query@pg${pkg.version}`);
    });
  }
}

function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    versions: []
  };
  
  const versionIndex = args.findIndex(arg => arg === '--versions' || arg === '-v');
  if (versionIndex !== -1 && args[versionIndex + 1]) {
    options.versions = args[versionIndex + 1].split(',').map(v => v.trim());
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
libpg-query Multi-Version Publisher

Usage:
  node scripts/publish-versions.js [options]

Options:
  --dry-run, -d           Run in dry-run mode (no actual publishing)
  --versions, -v <list>   Comma-separated list of versions to publish (e.g., "13,16,17")
  --help, -h              Show this help message

Examples:
  node scripts/publish-versions.js --dry-run
  node scripts/publish-versions.js --versions "16,17"
  node scripts/publish-versions.js --dry-run --versions "13"
`);
    return;
  }
  
  publishAllVersions(options);
}

if (require.main === module) {
  main();
}

module.exports = { publishAllVersions, getVersionPackages };
