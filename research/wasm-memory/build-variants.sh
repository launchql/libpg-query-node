#!/bin/bash
# Usage: build-variants.sh <ver> <variant>=<INITIAL>,<STACK>,<MAX>[,<extra emcc flags>] ...
# Links the cached libpg_query.a into wasm/libpg-query.{js,wasm} with the given memory flags and
# stores the result under builds/<ver>/<variant>/wasm/.
set -u
REPO=/home/ubuntu/repos/libpg-query-node
OUT=/home/ubuntu/wasmbench/builds
ver=$1; shift
cd $REPO/versions/$ver
# bench Makefile: force the memory knobs to be overridable (v17 has them hard-coded)
sed -E 's/-sINITIAL_MEMORY=[0-9]+/-sINITIAL_MEMORY=$(WASM_INITIAL_MEMORY)/; s/-sMAXIMUM_MEMORY=[0-9]+/-sMAXIMUM_MEMORY=$(WASM_MAXIMUM_MEMORY)/; s/-sSTACK_SIZE=[0-9]+/-sSTACK_SIZE=$(WASM_STACK_SIZE)/; s/-sINITIAL_MEMORY=\$\(WASM_INITIAL_MEMORY\)/-sINITIAL_MEMORY=$(WASM_INITIAL_MEMORY) $(WASM_EXTRA_FLAGS)/; s/^WASM_OUT_DIR := wasm/WASM_OUT_DIR := $(BENCH_OUT_DIR)/' Makefile > Makefile.bench
for spec in "$@"; do
  name=${spec%%=*}; vals=${spec#*=}
  IFS=, read -r init stack max extra <<< "$vals"
  dir=$OUT/$ver/$name; mkdir -p $dir/wasm
  echo "== v$ver $name init=$init stack=$stack max=$max extra='${extra:-}'"
  docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk:6.0.3 emmake make -f Makefile.bench build \
    BENCH_OUT_DIR=bench-out/$name WASM_INITIAL_MEMORY=$init WASM_STACK_SIZE=$stack WASM_MAXIMUM_MEMORY=$max WASM_EXTRA_FLAGS="${extra:-}" > $dir/build.log 2>&1
  rc=$?
  cp bench-out/$name/libpg-query.js bench-out/$name/libpg-query.wasm $dir/wasm/ 2>/dev/null
  echo "   exit $rc $(ls -la $dir/wasm/libpg-query.wasm 2>/dev/null | awk '{print $5}') bytes"
  echo "{\"ver\":\"$ver\",\"variant\":\"$name\",\"init\":$init,\"stack\":$stack,\"max\":$max,\"extra\":\"${extra:-}\",\"rc\":$rc}" >> $OUT/manifest.jsonl
done
