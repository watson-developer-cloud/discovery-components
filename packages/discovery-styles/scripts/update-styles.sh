#!/bin/sh

PDFJS_WEB_CSS=../../node_modules/pdfjs-dist/web/pdf_viewer.css
PDFJS_SCSS=scss/components/document-preview/_pdfjs_web_mixins.scss

function update_pdfjs_scss() {
  key=$1
  tmp=$PDFJS_SCSS.tmp
  
  sed -e "/BEGIN-QUOTE $key/q" $PDFJS_SCSS > $tmp
  cat >> $tmp
  sed -ne "/END-QUOTE $key/,\$p" $PDFJS_SCSS >> $tmp
  cp $tmp $PDFJS_SCSS;
  rm $tmp;
}

cat $PDFJS_WEB_CSS | awk '/^\/\*/,/\*\//' | update_pdfjs_scss "COMMENT"
cat $PDFJS_WEB_CSS | awk '/^\.textLayer/,/}/' | update_pdfjs_scss "TEXT-LAYER"
../../node_modules/.bin/prettier --write $PDFJS_SCSS
