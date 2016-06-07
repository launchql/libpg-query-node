#!/bin/bash

rDIR=$(pwd)
tmpDir=tmp_pg

mkdir -p $tmpDir
cd $tmpDir
git clone https://github.com/lfittl/libpg_query

cd libpg_query
make

wDIR=$(pwd)

file=$(ls | grep 'libpg_query.a')

if [ ! $file ]; then
	echo "ERROR: libpg_query not found";
	exit 1;
fi

#copy queryparser.cc, binding.gyp to current directory
#
#

cp $(pwd)/libpg_query.a $rDIR/libpg_query/linux/

rm -rf $rDIR/$tmpDir







