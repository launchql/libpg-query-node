#!/bin/bash
# Build the JS wrapper once per version (tsc via scripts/build.js) and copy it into every variant dir.
set -e
REPO=/home/ubuntu/repos/libpg-query-node
ver=$1
cd $REPO/versions/$ver
# scripts/build.js expects wasm/ to exist for the rename; use a scratch copy of the first variant's wasm
first=$(ls -d /home/ubuntu/wasmbench/builds/$ver/*/ | head -1)
mkdir -p wasm && cp $first/wasm/libpg-query.js $first/wasm/libpg-query.wasm wasm/
node scripts/build.js > /tmp/buildjs-$ver.log 2>&1
for d in /home/ubuntu/wasmbench/builds/$ver/*/; do
  cp wasm/index.cjs wasm/index.js wasm/index.d.ts $d/wasm/
  cp package.json $d/package.json
  if [ -d node_modules ]; then ln -sfn $REPO/versions/$ver/node_modules $d/node_modules; fi
done
rm -rf wasm cjs esm
echo "finalized v$ver: $(ls -d /home/ubuntu/wasmbench/builds/$ver/*/ | wc -l) variants"
