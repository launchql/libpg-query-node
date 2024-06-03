#!/usr/bin/env bash

LIBPG_REPO=___LIBPG_REPO___
LIBPG_COMMIT=___LIBPG_COMMIT___
LIBPG_BRANCH=___LIBPG_BRANCH___

# Check if variables are set and exit if not
if [ -z "$LIBPG_COMMIT" ]; then
    echo "ERROR: LIBPG_COMMIT variable is not set."
    exit 1
fi

if [ -z "$LIBPG_BRANCH" ]; then
    echo "ERROR: LIBPG_BRANCH variable is not set."
    exit 1
fi

if [ -z "$LIBPG_REPO" ]; then
    echo "ERROR: LIBPG_REPO variable is not set."
    exit 1
fi

# Remember current directory and create a new, unique, temporary directory
rDIR=$(pwd)
tmpDir=$(mktemp -d 2>/dev/null || mktemp -d -t 'tmpdir.XXXX')

# Define the make target
makeTarget=build

# Change to the newly created temp directory
cd "$tmpDir"

# Clone the selected branch of the libpg_query Git repo
git clone -b $LIBPG_BRANCH --single-branch $LIBPG_REPO
cd libpg_query

# Checkout the desired commit
git checkout $LIBPG_COMMIT

# needed if being invoked from within gyp
unset MAKEFLAGS
unset MFLAGS

# Adaptively build for macOS or Linux
if [ "$(uname)" == "Darwin" ]; then
	make CFLAGS='-mmacosx-version-min=10.7' PG_CFLAGS='-mmacosx-version-min=10.7' $makeTarget
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
	make CFLAGS='' PG_CFLAGS='' $makeTarget
fi

# Terminate if build fails
if [ $? -ne 0 ]; then
	echo "ERROR: 'make' command failed";
	exit 1;
fi

# Search for libpg_query.a, error if not found
file=$(ls | grep 'libpg_query.a')
if [ ! $file ]; then
	echo "ERROR: libpg_query.a not found";
	exit 1;
fi

# Error if pg_query.h is missing
file=$(ls | grep 'pg_query.h')
if [ ! $file ]; then
	echo "ERROR: pg_query.h not found";
	exit 1;
fi

# Copy queryparser.cc, binding.gyp to current directory
if [ "$(uname)" == "Darwin" ]; then
    cp $(pwd)/libpg_query.a $rDIR/libpg_query/osx/
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    cp $(pwd)/libpg_query.a $rDIR/libpg_query/linux/
fi

# Copy header
cp $(pwd)/pg_query.h $rDIR/libpg_query/include/
cp $(pwd)/protobuf/*.proto $rDIR/libpg_query/protobuf/

# Cleanup: revert to original directory and remove the temp
cd "$rDIR"
rm -rf "$tmpDir"
