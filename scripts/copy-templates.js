#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const HEADER = `/**
 * DO NOT MODIFY MANUALLY — this is generated from the templates dir
 * 
 * To make changes, edit the files in the templates/ directory and run:
 * npm run copy:templates
 */

`;

const MAKEFILE_HEADER = `# DO NOT MODIFY MANUALLY — this is generated from the templates dir
# 
# To make changes, edit the files in the templates/ directory and run:
# npm run copy:templates

`;

// Version-specific configurations
const VERSION_CONFIGS = {
  '13': {
    tag: '13-2.2.0',
    hasEmscriptenPatch: true
  },
  '14': {
    tag: '14-3.0.0',
    hasEmscriptenPatch: false
  },
  '15': {
    tag: '15-4.2.4',
    hasEmscriptenPatch: false
  },
  '16': {
    tag: '16-5.2.0',
    hasEmscriptenPatch: false
  },
  '17': {
    tag: '17-6.1.0',
    hasEmscriptenPatch: false
  }
};

// Files to copy from templates
const TEMPLATE_FILES = [
  { src: 'LICENSE', dest: 'LICENSE', header: false },
  { src: 'wasm_wrapper.c', dest: 'src/wasm_wrapper.c', header: HEADER },
  { src: 'libpg-query.d.ts', dest: 'src/libpg-query.d.ts', header: HEADER },
  { src: 'index.ts', dest: 'src/index.ts', header: HEADER }
];

function copyTemplates() {
  const templatesDir = path.join(__dirname, '..', 'templates');
  const versionsDir = path.join(__dirname, '..', 'versions');
  
  // Process each version
  for (const [version, config] of Object.entries(VERSION_CONFIGS)) {
    const versionDir = path.join(versionsDir, version);
    console.log(`\nProcessing version ${version}...`);
    
    // Copy template files
    for (const file of TEMPLATE_FILES) {
      const srcPath = path.join(templatesDir, file.src);
      const destPath = path.join(versionDir, file.dest);
      
      // Ensure destination directory exists
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Read template content
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Add header if specified
      if (file.header) {
        content = file.header + content;
      }
      
      // Write to destination
      fs.writeFileSync(destPath, content);
      console.log(`  ✓ Copied ${file.src} to ${file.dest}`);
    }
    
    // Process Makefile template
    const makefileTemplate = fs.readFileSync(path.join(templatesDir, 'Makefile.template'), 'utf8');
    let makefileContent = makefileTemplate.replace(/{{VERSION_TAG}}/g, config.tag);
    
    // Handle the USE_EMSCRIPTEN_PATCH placeholder
    if (config.hasEmscriptenPatch) {
      // For version 13, keep the patch block (remove only the placeholders)
      makefileContent = makefileContent.replace(
        /{{#USE_EMSCRIPTEN_PATCH}}\n?/g,
        ''
      );
      makefileContent = makefileContent.replace(
        /{{\/USE_EMSCRIPTEN_PATCH}}\n?/g,
        ''
      );
    } else {
      // For other versions, remove the entire block including placeholders
      makefileContent = makefileContent.replace(
        /{{#USE_EMSCRIPTEN_PATCH}}[\s\S]*?{{\/USE_EMSCRIPTEN_PATCH}}\n?/g,
        ''
      );
    }
    
    // Write Makefile with header
    fs.writeFileSync(path.join(versionDir, 'Makefile'), MAKEFILE_HEADER + makefileContent);
    console.log(`  ✓ Generated Makefile with tag ${config.tag}`);
  }
  
  console.log('\n✅ Template copying completed!');
}

// Run the script
copyTemplates();