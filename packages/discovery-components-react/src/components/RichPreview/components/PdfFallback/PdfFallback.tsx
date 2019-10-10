import React, { SFC, useState, useEffect } from 'react';
import { settings } from 'carbon-components';
import get from 'lodash/get';

import { ComputeFontFamilyAndWeight } from './utils/fallbackFonts';

interface Props {
  /**
   * Contains JSON data of the PDF
   */
  document: any;
  /**
   * Contains the current page number, default of 1
   */
  currentPage: number;
}

interface CellShape {
  bbox: Array<number>;
  font: FontShape;
  content: string;
}

interface FontShape {
  name: string;
  size: number;
  color: Array<number>;
  isBold: boolean;
  isItalic: boolean;
}

interface TextMappingsShape {
  page: PageShape;
  field: FieldShape;
}

interface PageShape {
  page_number: number;
  bbox: Array<number>;
}

interface FieldShape {
  name: string;
  index: number;
  span: Array<number>;
}

const ORIGINAL_HEIGHT = 792;
const ORIGINAL_WIDTH = 612;

const PdfFallback: SFC<Props> = ({ document, currentPage }) => {
  const [pages, setPages] = useState({});

  useEffect(() => {
    const newPages: any = {};
    const { text } = document;
    const font = {
      name: 'sans-serif',
      size: 12.0,
      color: [0, 0, 0, 255],
      isBold: false,
      isItalic: false
    };

    const textMappings = get(document, 'extracted_metadata.text_mappings', []);
    textMappings.map(({ page, field }: TextMappingsShape) => {
      const textValue = field.name === 'text' ? text : document[field.name][field.index];
      const content = textValue.substring(field.span[0], field.span[1]);
      const cellPageNumber = page.page_number;
      const cellData = { bbox: page.bbox, font: font, content: content };

      //Check if pages is present in the array
      if (newPages[cellPageNumber]) {
        //Add new cell to the page array
        newPages[cellPageNumber].cells.push(cellData);
      } else {
        //Add new page entry
        newPages[cellPageNumber] = {
          cells: [cellData]
        };
      }
    });
    setPages(newPages);
  }, [document]);

  const [cells, setCells] = useState([]);

  useEffect(() => {
    pages[currentPage] && setCells(pages[currentPage].cells);
  }, [pages, currentPage]);

  return (
    <div className={`${settings.prefix}--rich-preview-pdf-fallback`}>
      <svg
        viewBox={`0 0 ${ORIGINAL_WIDTH} ${ORIGINAL_HEIGHT}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        height="100%"
      >
        {cells.map((cell, index) => renderCell(cell, index))}
      </svg>
    </div>
  );
};

function renderCell(cell: CellShape, index: number): any {
  const { bbox, font, content } = cell;
  const { size, color, isBold, isItalic, name } = font;
  const { fontFamily, fontWeight } = ComputeFontFamilyAndWeight(name);
  const [left, top, right, bottom] = bbox;
  const boxWidth = right - left;

  return (
    <text
      key={index}
      x={left}
      y={ORIGINAL_HEIGHT - top}
      width={boxWidth}
      height={bottom - top}
      textLength={boxWidth}
      lengthAdjust="spacingAndGlyphs"
      style={{
        fontSize: `${size}px`,
        fontFamily: `${name}, ${fontFamily}`,
        fill: `rgb(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`,
        fontWeight: isBold ? 'bold' : fontWeight,
        fontStyle: isItalic ? 'italic' : 'normal'
      }}
    >
      {content}
    </text>
  );
}

export default PdfFallback;
