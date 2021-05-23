#!/usr/bin/env sh

for entry in ./src/forms/*
do
  echo "$entry"
  # FIXME: use npx
  ../pdffiller-script/bin/map "$entry" --out src/maps
  mv src/maps/*example-filled.pdf examples/
  rm src/maps/*-example-*.*
done

rm *.fdf
