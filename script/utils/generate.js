#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
    configDir,
    templatesDir,
    rootDir
} = require('./config');

const {
    getConfig
} = require('./get-config');

const {
    getTemplates
} = require('./get-templates');

// Read the PGENV from the command line arguments
const envFilter = process.argv[2];
console.log({envFilter})

if (!envFilter) {
    console.error('Usage: node script.js <ENV>');
    console.error('ENV is PG version, e.g. pg-15');
    process.exit(1);
}

// Load templates and configurations
const templates = getTemplates(templatesDir);
const configs = getConfig(configDir);

// Filter configurations based on the command line input
const filteredConfigs = configs.filter(config => config.PGENV === envFilter);

if (filteredConfigs.length === 0) {
    console.error(`No configurations found for ENV: ${envFilter}`);
    process.exit(1);
}

// Directory to output the processed templates
const outputDir = path.join(rootDir, 'script');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// get config
const config = filteredConfigs[0];

// update the package.json
const packageJsonPath = path.join(__dirname, '../../package.json');
let packageJson = fs.readFileSync(packageJsonPath, 'utf8');
packageJson = JSON.parse(packageJson);
packageJson.dependencies['@pgsql/types'] = config.PGSQL_TYPES;
packageJson.libpgQueryConfig = config;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

// Generate build files from the templates
templates.forEach(template => {
    // Replace placeholders in the template content
    let content = template.content;
    // Dynamic replacement for each key in the config
    Object.keys(config).forEach(key => {
        const placeholder = new RegExp(`___${key.toUpperCase()}___`, 'g');
        content = content.replace(placeholder, config[key]);
    });

    // Define the output path for the processed template
    const outputFile = path.join(outputDir, `${template.name}`);

    // Determine the file extension
    const extension = path.extname(outputFile).toLowerCase();

    // Mapping of file extensions to single-line comment syntax
    const commentMap = {
        '.bat': '::',
        '.sh': '#',
        '.js': '//',
        '.ts': '//',
    };

    // Determine the comment prefix from the map or use default
    const commentPrefix = commentMap.hasOwnProperty(extension) ? commentMap[extension] : defaultComment;
    let header = '';

    let newContent = '';

    if (commentPrefix) {
        const commentLine = `${commentPrefix} this file is auto-generated, use "yarn generate:build <env>" to rebuild with an env (e.g., pg-15)\n`;
        if (content.startsWith('#!')) {
            // Find the end of the first line (shebang)
            const firstLineEnd = content.indexOf('\n') + 1;
            newContent = content.substring(0, firstLineEnd) + commentLine + content.substring(firstLineEnd);
        } else {
            newContent = commentLine + content;
        }
    } else {
        newContent = content; // No comment to add
    }
    
    fs.writeFileSync(outputFile, newContent, 'utf8');
    console.log(`Written: ${outputFile}`);
});
