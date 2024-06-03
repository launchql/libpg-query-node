const { exec } = require('child_process');
const { join } = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

// if (typeof process.argv[2] !== 'string') {
//   throw new Error('branchName not provided');
// }

const yamldir = (s) => join(__dirname, '/../.yamlize/', s);
const workflowDir = (s) => join(__dirname, '/../.github/workflows/', s);

const cmd = (config, workflow) => ([
  'yamlize',
  '--config',
  yamldir(`config/${config}`),

  '--inFile',
  yamldir(`workflows/${workflow}`),

  '--outFile',
  workflowDir(`generated-${workflow}`),
].join(' '));


exec(cmd('config.yaml', 'build-and-publish-no-win.yaml'), (error, _stdout, _stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }

  // Read the generated YAML file
  const outputPath = workflowDir(`generated-build-and-publish-no-win.yaml`);
  try {
    const fileContents = fs.readFileSync(outputPath, 'utf8');
    const data = yaml.load(fileContents);

    // Modify the top-level 'name' property
    data.name = 'Generated Build libpg-query no windows 🛠';

    // Write the modified YAML back to the file
    const newYamlContent = yaml.dump(data, { lineWidth: -1 });
    fs.writeFileSync(outputPath, newYamlContent, 'utf8');
  } catch (readOrWriteError) {
    console.error(`Error processing YAML file: ${readOrWriteError}`);
  }
});