#!/bin/sh
BASEDIR=$(dirname "$0")/..
PDFJS_WEB_CSS=$BASEDIR/../../node_modules/pdfjs-dist/web/pdf_viewer.css
PDFJS_SCSS=$BASEDIR/scss/components/document-preview/_pdfjs_web_mixins.scss

# generate PDFJS_SCSS
node $BASEDIR/scripts/generate-pdfjs_web_mixin.js "$PDFJS_WEB_CSS" "$PDFJS_SCSS"

# perttier
../../node_modules/.bin/prettier --write "$PDFJS_SCSS"
