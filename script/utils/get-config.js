const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

module.exports.getConfig = (directory) => {
    let result = []

    // Read all files in the directory recursively
    const readDirectory = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                // Recursively read subdirectory
                readDirectory(fullPath);
            } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
                // Read and parse YAML file
                
                try {
                    const fileContents = fs.readFileSync(fullPath, 'utf8');
                    const parsedYaml = yaml.load(fileContents);
                    const key = path.relative(directory, fullPath); // Use relative path as key
                    result.push(parsedYaml.env);
                } catch (error) {
                    console.error(`Error reading file ${fullPath}:`, error);
                }
            }
        }
    };

    readDirectory(directory);

    return result;
}