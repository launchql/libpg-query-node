#!/usr/bin/env bash

commit=1ec38940e5c6f09a4c1d17a46d839a881c4f2db7

rDIR=$(pwd)
tmpDir=$(mktemp -d 2>/dev/null || mktemp -d -t 'tmpdir.XXXX')
makeTarget=build

cd "$tmpDir"

git clone -b 16-latest --single-branch https://github.com/pganalyze/libpg_query.git
cd libpg_query

git checkout $commit

# needed if being invoked from within gyp
unset MAKEFLAGS
unset MFLAGS

if [ "$(uname)" == "Darwin" ]; then
	make CFLAGS='-mmacosx-version-min=10.7' PG_CFLAGS='-mmacosx-version-min=10.7' $makeTarget
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
	make CFLAGS='' PG_CFLAGS='' $makeTarget
fi

if [ $? -ne 0 ]; then
	echo "ERROR: 'make' command failed";
	exit 1;
fi

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

cd "$rDIR"
rm -rf "$tmpDir"
