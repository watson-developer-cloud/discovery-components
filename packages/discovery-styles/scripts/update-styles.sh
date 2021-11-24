#!/bin/sh

PDFJS_WEB_CSS=../../node_modules/pdfjs-dist/web/pdf_viewer.css
PDFJS_SCSS=scss/components/document-preview/_pdfjs_web_mixins.scss

function replace_quote() {
  file=$1
  key=$2
  tmp=$file.tmp
  
  sed -e "/BEGIN-QUOTE $key/q" $file > $tmp
  cat >> $tmp
  sed -ne "/END-QUOTE $key/,\$p" $file >> $tmp
  cp $tmp $file;
  rm $tmp;
}

cat $PDFJS_WEB_CSS | awk '/^\/\*/,/\*\//' | replace_quote $PDFJS_SCSS "COMMENT"
cat $PDFJS_WEB_CSS | awk '/^\.textLayer/,/}/' | replace_quote $PDFJS_SCSS "TEXT-LAYER"
../../node_modules/.bin/prettier --write $PDFJS_SCSS
