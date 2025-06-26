#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Version configurations
const VERSION_CONFIGS = {
  '13': {
    libpgQueryTag: '13-2.2.0',
    useEmscriptenPatch: true
  },
  '14': {
    libpgQueryTag: '14-3.0.0',
    useEmscriptenPatch: false
  },
  '15': {
    libpgQueryTag: '15-4.2.4',
    useEmscriptenPatch: false
  },
  '16': {
    libpgQueryTag: '16-5.2.0',
    useEmscriptenPatch: false
  },
  '17': {
    libpgQueryTag: '17-6.1.0',
    useEmscriptenPatch: false
  }
};

// Headers for different file types
const HEADERS = {
  // JavaScript/TypeScript/C style comment
  default: `/**
 * DO NOT MODIFY MANUALLY — this is generated from the templates dir
 * 
 * To make changes, edit the files in the templates/ directory and run:
 * npm run copy:templates
 */

`,
  // Makefile style comment
  makefile: `# DO NOT MODIFY MANUALLY — this is generated from the templates dir
# 
# To make changes, edit the files in the templates/ directory and run:
# npm run copy:templates

`
};

// File extensions that should get headers
const HEADER_EXTENSIONS = ['.ts', '.js', '.c'];
const MAKEFILE_NAMES = ['Makefile', 'makefile'];

/**
 * Process template content with simple mustache-like syntax
 * @param {string} content - Template content
 * @param {object} config - Configuration object
 * @returns {string} Processed content
 */
function processTemplate(content, config) {
  // Replace simple variables
  content = content.replace(/\{\{LIBPG_QUERY_TAG\}\}/g, config.libpgQueryTag);
  
  // Handle conditional blocks
  // {{#USE_EMSCRIPTEN_PATCH}}...{{/USE_EMSCRIPTEN_PATCH}}
  const conditionalRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  
  content = content.replace(conditionalRegex, (match, flag, blockContent) => {
    if (flag === 'USE_EMSCRIPTEN_PATCH' && config.useEmscriptenPatch) {
      return blockContent;
    }
    return '';
  });
  
  return content;
}

/**
 * Add header to file content if applicable
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 * @returns {string} Content with header if applicable
 */
function addHeaderIfNeeded(filePath, content) {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath);
  
  // Check if it's a Makefile
  if (MAKEFILE_NAMES.includes(basename)) {
    return HEADERS.makefile + content;
  }
  
  // Check if it's a source file that needs a header
  if (HEADER_EXTENSIONS.includes(ext)) {
    return HEADERS.default + content;
  }
  
  return content;
}

/**
 * Copy a file from template to destination with processing
 * @param {string} templatePath - Source template path
 * @param {string} destPath - Destination path
 * @param {object} config - Version configuration
 */
function copyTemplate(templatePath, destPath, config) {
  const content = fs.readFileSync(templatePath, 'utf8');
  const processedContent = processTemplate(content, config);
  const finalContent = addHeaderIfNeeded(destPath, processedContent);
  
  // Ensure destination directory exists
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.writeFileSync(destPath, finalContent);
}

/**
 * Copy all templates for a specific version
 * @param {string} version - Version number
 * @param {object} config - Version configuration
 */
function copyTemplatesForVersion(version, config) {
  const templatesDir = path.join(__dirname, '..', 'templates');
  const versionDir = path.join(__dirname, '..', 'versions', version);
  
  // Check if version directory exists
  if (!fs.existsSync(versionDir)) {
    console.warn(`Warning: Directory ${versionDir} does not exist. Skipping...`);
    return;
  }
  
  // Files to copy
  const filesToCopy = [
    'LICENSE',
    'Makefile',
    'src/index.ts',
    'src/libpg-query.d.ts',
    'src/wasm_wrapper.c'
  ];
  
  filesToCopy.forEach(file => {
    const templatePath = path.join(templatesDir, file);
    const destPath = path.join(versionDir, file);
    
    if (!fs.existsSync(templatePath)) {
      console.error(`Error: Template file ${templatePath} does not exist!`);
      return;
    }
    
    copyTemplate(templatePath, destPath, config);
  });
  
  console.log(`✓ Version ${version} completed`);
}

/**
 * Main function
 */
function main() {
  console.log('Copying template files to version directories...\n');
  
  // Process each version
  Object.entries(VERSION_CONFIGS).forEach(([version, config]) => {
    console.log(`Processing version ${version}...`);
    copyTemplatesForVersion(version, config);
  });
  
  console.log('\nAll versions processed successfully!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processTemplate, copyTemplatesForVersion };