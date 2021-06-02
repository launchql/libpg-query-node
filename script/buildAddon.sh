#!/usr/bin/env bash

commit=55668e9003dfb148bc74b9c5d4a41facc5bad5c7

rDIR=$(pwd)
rnd=$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 13 ; echo)
tmpDir=/tmp/$rnd

mkdir -p $tmpDir

cd $tmpDir

git clone -b 13-latest --single-branch https://github.com/pganalyze/libpg_query.git
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
