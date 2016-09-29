#!/bin/bash

commit=e72427dad4a61691df0b749333f939b64362db62

rDIR=$(pwd)
tmpDir=tmp_pg

mkdir -p $tmpDir
cd $tmpDir

git clone -b 9.5-latest --single-branch https://github.com/lfittl/libpg_query
cd libpg_query

echo "git checkout to $commit"
git checkout $commit .

make

wDIR=$(pwd)

file=$(ls | grep 'libpg_query.a')

if [ ! $file ]; then
	echo "ERROR: libpg_query.a not found";
	exit 1;
fi

file=$(ls | grep 'pg_query.h')

if [ ! $file ]; then
	echo "ERROR: pg_query.h not found";
	exit 1;
fi

#copy queryparser.cc, binding.gyp to current directory
#
#

cp $(pwd)/libpg_query.a $rDIR/libpg_query/linux/
cp $(pwd)/pg_query.h $rDIR/libpg_query/include/

rm -rf $rDIR/$tmpDir
