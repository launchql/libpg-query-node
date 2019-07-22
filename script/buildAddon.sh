#!/usr/bin/env bash

commit=d710cb0f3edf4a0f98dde5b4411ea103fd4b1807

rDIR=$(pwd)
tmpDir=tmp_pg

mkdir -p $tmpDir
cd $tmpDir

git clone -b 10-latest --single-branch https://github.com/lfittl/libpg_query
cd libpg_query

# echo "git checkout to $commit"
git checkout $commit

make

if [ $? -ne 0 ]; then
	echo "ERROR: 'make' command failed";
	exit 1;
fi

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

if [ "$(uname)" == "Darwin" ]; then
    cp $(pwd)/libpg_query.a $rDIR/libpg_query/osx/
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    cp $(pwd)/libpg_query.a $rDIR/libpg_query/linux/
fi

cp $(pwd)/pg_query.h $rDIR/libpg_query/include/

rm -rf $rDIR/$tmpDir
