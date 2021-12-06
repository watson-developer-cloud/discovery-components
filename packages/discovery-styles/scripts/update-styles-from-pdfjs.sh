#!/bin/sh
#
# This script updates PDF text layer CSS from the `pdfjs-dist` npm package
#
# When you upgrade the `pdfjs-dist` package, you have to run this script
# to include the style changes.
#
# Usage: $ scripts/update-styles.sh
# - You must run `yarn` to install `pdfjs-dist` package before running
#
BASEDIR=$(dirname "$0")/..

# pdfjs textLayer styles
PDFJS_WEB_CSS=$BASEDIR/../../node_modules/pdfjs-dist/web/pdf_viewer.css
PDFJS_SCSS=$BASEDIR/scss/components/document-preview/_pdfjs_web_mixins.scss
yarn node $BASEDIR/scripts/generate-pdfjs_web_mixin.js "$PDFJS_WEB_CSS" "$PDFJS_SCSS"

# prettier
yarn run prettier --write "$PDFJS_SCSS"
