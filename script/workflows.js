const { exec } = require('child_process');
const { join } = require('path');

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
  workflowDir(`gen/${workflow}`),
].join(' '));


exec(cmd('config.yaml', 'build-and-test.yaml'), (error, _stdout, _stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
});