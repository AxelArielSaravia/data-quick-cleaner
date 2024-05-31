#!/bin/bash

#This build use:
# Bun.js to bundle and minify javascript (https://bun.sh/)
# tdewolff/minify to minify html, css and json (https://github.com/tdewolff/minify)

NAME="data-quick-cleaner"

if [[ ! -d "./extension" ]]; then
    mkdir ./extension
fi
if [[ ! -d "./extension/images" ]]; then
    mkdir ./extension/images
fi


_img() {
    cp ./src/images ./extension
}

version=""
if [[ "$1" == "-v" && "$2" != "" ]]; then
    version="$2"

    if [[ "$3" == "-img" ]]; then
        _img
    fi
elif [[ "$1" == "-img" ]]; then
    _img
else
    echo "Format: build.sh [-v VERSION_NUMBER] [-img]"
    echo ""
    echo "    -v    create a zip file from 'extension' dir"
    echo "    -img  copy src/images on extension dir"
    echo ""
fi

errs=0
#Build tools
bun build ./src/index.js --outdir ./extension --minify-whitespace
if [[ $? == 0 ]]; then
    echo JS build and minify
else
    errs=$(($errs + 1))
fi

minify --html-keep-end-tags -o ./extension/index.html ./src/index.html
if [[ $? == 0 ]]; then
    echo index.html minified success
else
    errs=$(($errs + 1))
fi
minify --html-keep-end-tags -o ./extension/about.html ./src/about.html
if [[ $? == 0 ]]; then
    echo about.html minified success
else
    errs=$(($errs + 1))
fi

minify -o ./extension/root.css ./src/root.css
if [[ $? == 0 ]]; then
    echo root.css minified success
else
    errs=$(($errs + 1))
fi
minify -o ./extension/index.css ./src/index.css
if [[ $? == 0 ]]; then
    echo index.css minified success
else
    errs=$(($errs + 1))
fi
minify -o ./extension/about.css ./src/about.css
if [[ $? == 0 ]]; then
    echo about.css minified success
else
    errs=$(($errs + 1))
fi

minify -o ./extension/manifest.json ./src/manifest.json
if [[ $? == 0 ]]; then
    echo manifest.json minified success
else
    errs=$(($errs + 1))
fi

if (( $errs > 0 )); then
    exit 0
fi

if [[ $version != "" ]]; then
    cd ./extension && zip "$NAME-v$version.zip" ./* ./images/*
    cd ../
    mv "./extension/$NAME-v$version.zip" ./zips
fi
