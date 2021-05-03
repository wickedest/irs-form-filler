#!/usr/bin/env sh

# ../pdffiller-script/bin/map src/forms/f1040.pdf --out src/maps

for entry in ./src/forms/*
do
  echo "$entry"
  ../pdffiller-script/bin/map "$entry" --out src/maps
  mv src/maps/*example-filled.pdf examples/
  rm src/maps/*-example-*.*
done

rm *.fdf
