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

function modifyPackageJsonForPublishing(packagePath, version, customVersion = null) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  packageJson.name = 'libpg-query';
  
  if (customVersion) {
    packageJson.version = customVersion;
  } else {
    packageJson.version = `${version}.0.0`;
  }
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  
  return packageJson;
}

function publishPackage(packageInfo, options = {}) {
  const { dryRun = false, customVersion = null, skipBuild = false } = options;
  const { path: packagePath, packageJsonPath, version } = packageInfo;
  const distTag = `pg${version}`;
  const publishVersion = customVersion || `${version}.0.0`;
  
  console.log(`\n📦 Publishing ${packageInfo.originalName} as libpg-query@${distTag}`);
  console.log(`   Version: ${publishVersion}`);
  
  if (dryRun) {
    console.log(`   [DRY RUN] Would modify package.json: name -> "libpg-query", version -> "${publishVersion}"`);
    if (!skipBuild) {
      console.log(`   [DRY RUN] Would run: cd ${packagePath} && pnpm build`);
    }
    console.log(`   [DRY RUN] Would run: cd ${packagePath} && pnpm publish --tag ${distTag}`);
    return;
  }
  
  let backupPath;
  try {
    backupPath = backupPackageJson(packageJsonPath);
    
    modifyPackageJsonForPublishing(packageJsonPath, version, customVersion);
    
    if (!skipBuild) {
      console.log(`   Building package...`);
      execSync('pnpm build', { cwd: packagePath, stdio: 'inherit' });
    }
    
    console.log(`   Publishing with tag ${distTag}...`);
    execSync(`pnpm publish --tag ${distTag}`, { cwd: packagePath, stdio: 'inherit' });
    
    console.log(`   ✅ Successfully published libpg-query@${distTag} (${publishVersion})`);
    
  } catch (error) {
    console.error(`   ❌ Failed to publish ${packageInfo.originalName}:`, error.message);
    throw error;
  } finally {
    if (backupPath) {
      restorePackageJson(packageJsonPath);
    }
  }
}

function publishMainPackage(options = {}) {
  const { dryRun = false, customVersion = null, skipBuild = false, publishAs = '@pgsql/parser' } = options;
  
  console.log(`🚀 libpg-query Main Package Publisher (${publishAs})`);
  console.log('='.repeat(50));
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No actual publishing will occur\n');
  }
  
  const mainPackagePath = './libpg-query';
  const packageJsonPath = path.join(mainPackagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ Main package not found at ./libpg-query');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const publishVersion = customVersion || packageJson.version;
  
  console.log(`Publishing main package as: ${publishAs}`);
  console.log(`Version: ${publishVersion}`);
  console.log(`Original name: ${packageJson.name}`);
  
  if (dryRun) {
    console.log(`[DRY RUN] Would modify package.json: name -> "${publishAs}", version -> "${publishVersion}"`);
    if (!skipBuild) {
      console.log(`[DRY RUN] Would run: cd ${mainPackagePath} && pnpm build`);
    }
    console.log(`[DRY RUN] Would run: cd ${mainPackagePath} && pnpm publish`);
    return;
  }
  
  let backupPath;
  try {
    backupPath = backupPackageJson(packageJsonPath);
    
    const modifiedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    modifiedPackageJson.name = publishAs;
    if (customVersion) {
      modifiedPackageJson.version = customVersion;
    }
    fs.writeFileSync(packageJsonPath, JSON.stringify(modifiedPackageJson, null, 2) + '\n');
    
    if (!skipBuild) {
      console.log(`Building main package...`);
      execSync('pnpm build', { cwd: mainPackagePath, stdio: 'inherit' });
    }
    
    console.log(`Publishing as ${publishAs}...`);
    execSync('pnpm publish', { cwd: mainPackagePath, stdio: 'inherit' });
    
    console.log(`✅ Successfully published ${publishAs} (${publishVersion})`);
    
  } catch (error) {
    console.error(`❌ Failed to publish main package:`, error.message);
    throw error;
  } finally {
    if (backupPath) {
      restorePackageJson(packageJsonPath);
    }
  }
}

function publishAllVersions(options = {}) {
  const { dryRun = false, versions = [], customVersion = null, skipBuild = false } = options;
  
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
    const publishVersion = customVersion || `${pkg.version}.0.0`;
    console.log(`  - ${pkg.originalName} (v${pkg.version}) -> libpg-query@pg${pkg.version} (${publishVersion})`);
  });
  
  if (customVersion) {
    console.log(`\n📝 Using custom version: ${customVersion}`);
  }
  
  if (!dryRun) {
    console.log('\n⚠️  This will publish to npm registry. Continue? (Press Ctrl+C to cancel)');
    execSync('sleep 5');
  }
  
  let publishedCount = 0;
  let failedCount = 0;
  
  for (const packageInfo of packagesToPublish) {
    try {
      publishPackage(packageInfo, { dryRun, customVersion, skipBuild });
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
    versions: [],
    customVersion: null,
    skipBuild: args.includes('--skip-build'),
    publishMain: args.includes('--main'),
    publishAs: '@pgsql/parser'
  };
  
  const versionIndex = args.findIndex(arg => arg === '--versions' || arg === '-v');
  if (versionIndex !== -1 && args[versionIndex + 1]) {
    options.versions = args[versionIndex + 1].split(',').map(v => v.trim());
  }
  
  const customVersionIndex = args.findIndex(arg => arg === '--set-version');
  if (customVersionIndex !== -1 && args[customVersionIndex + 1]) {
    options.customVersion = args[customVersionIndex + 1];
  }
  
  const publishAsIndex = args.findIndex(arg => arg === '--publish-as');
  if (publishAsIndex !== -1 && args[publishAsIndex + 1]) {
    options.publishAs = args[publishAsIndex + 1];
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
libpg-query Multi-Version Publisher

DESCRIPTION:
  Publishes multiple PostgreSQL version packages under the unified "libpg-query" 
  name using dist-tags, and supports publishing the main package as @pgsql/parser.
  Handles workspace naming conflicts by temporarily modifying package.json files.

USAGE:
  node scripts/publish-versions.js [options]

OPTIONS:
  --dry-run, -d              Run in dry-run mode (no actual publishing)
  --versions, -v <list>      Comma-separated list of versions to publish (e.g., "13,16,17")
  --set-version <version>    Set custom version for all packages (e.g., "1.2.3")
  --skip-build               Skip the build step (assumes packages are already built)
  --main                     Publish the main libpg-query package as @pgsql/parser
  --publish-as <name>        Custom package name for main package (default: @pgsql/parser)
  --help, -h                 Show this help message

EXAMPLES:
  # Test publishing all versions (dry-run)
  node scripts/publish-versions.js --dry-run
  
  # Publish specific versions
  node scripts/publish-versions.js --versions "16,17"
  
  # Publish with custom version
  node scripts/publish-versions.js --versions "17" --set-version "1.3.0"
  
  # Test single version with custom version
  node scripts/publish-versions.js --dry-run --versions "13" --set-version "2.0.0"
  
  # Skip build step (if already built)
  node scripts/publish-versions.js --versions "17" --skip-build
  
  # Publish main package as @pgsql/parser (dry-run)
  node scripts/publish-versions.js --dry-run --main
  
  # Publish main package with custom version
  node scripts/publish-versions.js --main --set-version "1.0.0"
  
  # Publish main package with custom name
  node scripts/publish-versions.js --main --publish-as "@myorg/pg-parser"

PUBLISHING WORKFLOW:
  1. Script discovers all version packages in versions/ directory
  2. For each package:
     - Backs up original package.json
     - Temporarily changes name to "libpg-query" 
     - Sets version (default: {major}.0.0, or custom with --set-version)
     - Builds package (unless --skip-build)
     - Publishes with dist-tag pg{version}
     - Restores original package.json
  
  3. Users can then install: npm install libpg-query@pg17

VERSION MANAGEMENT:
  - Default: Uses major version matching folder (13.0.0, 14.0.0, etc.)
  - Custom: Use --set-version to specify exact version
  - Dist-tags: Always uses pg{version} format (pg13, pg14, pg15, pg16, pg17)

SAFETY FEATURES:
  - Dry-run mode for testing
  - Automatic backup/restore of package.json files
  - Error handling with cleanup
  - 5-second confirmation before actual publishing
`);
    return;
  }
  
  if (options.publishMain) {
    publishMainPackage(options);
  } else {
    publishAllVersions(options);
  }
}

if (require.main === module) {
  main();
}

module.exports = { publishAllVersions, publishMainPackage, getVersionPackages };
