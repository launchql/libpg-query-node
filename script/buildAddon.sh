#!/bin/bash

rDIR=$(pwd)
tmpDir=tmp_pg

mkdir -p $tmpDir
cd $tmpDir
git clone git://github.com/lfittl/libpg_query

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

cd $rDIR

node-gyp configure

node-gyp build

if [ $? -ne 0 ]; then
    echo "ERROR: node-gyp failed to build pg-query.node";
	exit 1;
fi

echo "node-gyp successfully built pg-query.node";

if [ ! -d $rDIR/build ]; then
    echo "ERROR: $rDIR/build not found";
    exit 1;
fi

cd build/

if [ ! -d $rDIR/build/Release ]; then
	echo "ERROR: $rDIR/build/Release not found";
	exit 1;
fi

cd Release/

if [ ! -f $rDIR/build/Release/pg-query.node ]; then
	echo "ERROR: $rDIR/build/Release/pg-query.node not found";
	exit 1;
fi

mkdir -p $rDIR/libs

cp $rDIR/build/Release/pg-query.node $rDIR/libs

if [ $? -ne 0 ]; then
    echo "ERROR: failed to move pg-query.node to libs directory";
	exit 1;
fi

echo "pg-query.node copied to libs directory";

rm -rf $rDIR/$tmpDir
rm -rf $rDIR/build

echo "Successfully built pg-query.node";





