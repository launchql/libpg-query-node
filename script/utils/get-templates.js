const fs = require('fs');
const path = require('path');

module.exports.getTemplates = (templatesDir) => {
  try {
    const files = fs.readdirSync(templatesDir);
    return files.map(file => {
      const filePath = path.join(templatesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      return {
        name: path.basename(filePath),
        filePath,
        content
      }
    });
  } catch (err) {
    console.error('Error processing the directory:', err);
  }

};