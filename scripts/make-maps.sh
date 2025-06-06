#!/usr/bin/env sh

mkdir -p examples

for entry in ./src/forms/*
do
  echo "$entry"
  # FIXME: use npx
  ../pdffiller-script/bin/map.js "$entry" --example --out src/maps
  mv src/maps/*example-filled.pdf examples/
  rm -rf src/maps/*-example-*.*
done

rm -rf *.fdf
