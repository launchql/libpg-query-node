const path = require('path');
const rootDir = path.join(__dirname, '/../../');
module.exports.rootDir = rootDir;
module.exports.templatesDir = path.join(rootDir, '.templates');
module.exports.yamlizeDir = path.join(rootDir, '.yamlize');
module.exports.configDir = path.join(rootDir, '.yamlize/versions');