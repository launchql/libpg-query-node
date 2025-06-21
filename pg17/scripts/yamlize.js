const { exec } = require('child_process');
const { join } = require('path');

const yamldir = (s) => join(__dirname, '/../.yamlize/', s);
const workflowDir = (s) => join(__dirname, '/../.github/workflows/', s);

const cmd = () => ([
  'yamlize',
  '--config',
  yamldir(`config/config.yaml`),

  '--inFile',
  yamldir(`workflows/build.yaml`),

  '--outFile',
  workflowDir(`build-wasm-no-docker.yaml`),
].join(' '));


exec(cmd(), (error, _stdout, _stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
});