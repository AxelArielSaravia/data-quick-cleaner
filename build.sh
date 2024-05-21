#!/bin/bash

#This build use:
# Bun.js to bundle and minify javascript (https://bun.sh/)
# tdewolff/minify to minify html, css and json (https://github.com/tdewolff/minify)

if [[ ! -d "./extension" ]]; then
    mkdir ./extension
fi
if [[ ! -d "./extension/images" ]]; then
    mkdir ./extension/images
fi

bun build ./src/index.js --outdir ./extension --minify-whitespace
if [[ $? == 0 ]]; then
    echo JS build and minify
fi

minify --html-keep-end-tags -o ./extension/index.html ./src/index.html
if [[ $? == 0 ]]; then
    echo index.html minified success
fi
minify --html-keep-end-tags -o ./extension/about.html ./src/about.html
if [[ $? == 0 ]]; then
    echo about.html minified success
fi

minify -o ./extension/root.css ./src/root.css
if [[ $? == 0 ]]; then
    echo root.css minified success
fi
minify -o ./extension/index.css ./src/index.css
if [[ $? == 0 ]]; then
    echo index.css minified success
fi
minify -o ./extension/about.css ./src/about.css
if [[ $? == 0 ]]; then
    echo about.css minified success
fi

minify -o ./extension/manifest.json ./src/manifest.json
if [[ $? == 0 ]]; then
    echo manifest.json minified success
fi
