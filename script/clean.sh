#!/bin/bash

echo removing object files...
find ./libpg_query/ -name "*.a"  | xargs rm

echo clearing build...
rm -rf build/*
