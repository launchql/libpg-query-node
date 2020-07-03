#!/usr/bin/env bash

commit=2eab0008556a7e46289a9907d03e9b2534376c56

rDIR=$(pwd)
tmpDir=/tmp

cd $tmpDir

git clone -b 10-latest --single-branch https://github.com/ethanresnick/libpg_query
cd libpg_query

# echo "git checkout to $commit"
git checkout $commit


if [ "$(uname)" == "Darwin" ]; then
	make CFLAGS='-mmacosx-version-min=10.7' PG_CFLAGS='-mmacosx-version-min=10.7'
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
	make CFLAGS='' PG_CFLAGS=''
fi

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

cd $rDIR && rm -rf $wDIR