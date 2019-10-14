import React, { ReactElement, FC, useState, useEffect } from 'react';
import { settings } from 'carbon-components';
import get from 'lodash/get';
import { QueryResult } from '@disco-widgets/ibm-watson/discovery/v1';
import { ComputeFontFamilyAndWeight } from './utils/fallbackFonts';

interface Props {
  /**
   * Contains JSON data of the PDF
   */
  document: QueryResult;
  /**
   * Contains the current page number, default of 1
   */
  currentPage: number;
}

interface Page {
  width: number;
  height: number;
  origin: string; // TODO 'TopLeft' | 'BottomLeft';
  cells: Cell[];
}
interface Cell {
  bbox: number[];
  font: Font;
  content: string;
}

interface Font {
  name: string;
  size: number;
  color: number[];
  isBold: boolean;
  isItalic: boolean;
}

interface TextMappings {
  page: {
    page_number: number;
    bbox: number[];
  };
  field: Field;
}

interface Field {
  name: string;
  index: number;
  span: number[];
}

const EMPTY_PAGE = {
  width: 612,
  height: 792,
  origin: 'TopLeft',
  cells: []
};

const PdfFallback: FC<Props> = ({ document, currentPage }) => {
  const [pages, setPages] = useState<Page[]>([]);
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
    if (!textMappings) {
      return;
    }

    textMappings.cells.map(({ page, field }: TextMappings) => {
      const textValue = field.name === 'text' ? text : getFieldText(document, field);
      const content = textValue.substring(field.span[0], field.span[1]);
      const cellPageNumber = page.page_number;
      const cellData = { bbox: page.bbox, font: font, content: content };

      // check if pages is present in the array
      if (newPages[cellPageNumber]) {
        // add new cell to the page array
        newPages[cellPageNumber].cells.push(cellData);
      } else {
        // add new page entry
        const pageData = textMappings.pages[cellPageNumber - 1];
        newPages[cellPageNumber] = {
          width: pageData.width,
          height: pageData.height,
          origin: pageData.origin,
          cells: [cellData]
        };
      }
    });
    setPages(newPages);
  }, [document]);

  const [page, setPage] = useState<Page>(EMPTY_PAGE);
  useEffect(() => {
    if (pages[currentPage]) {
      setPage(pages[currentPage]);
    } else {
      setPage(EMPTY_PAGE);
    }
  }, [pages, currentPage]);

  // TODO handle `origin`

  return (
    <div className={`${settings.prefix}--rich-preview-pdf-fallback`}>
      <svg
        viewBox={`0 0 ${page.width} ${page.height}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        height="100%"
      >
        {page.cells.map((cell, index) => renderCell(page, cell, index))}
      </svg>
    </div>
  );
};

/**
 * Returns true if document can use PdfFallback
 * @param document query result
 * @returns {boolean}
 */
export const supportsPdfFallback = (document: QueryResult): boolean => {
  return !!get(document, 'extracted_metadata.text_mappings');
};

function getFieldText(document: QueryResult, field: Field): string {
  const [fieldName, fieldProp] = field.name.split('.');
  return document[fieldName][field.index][fieldProp];
}

function renderCell(page: Page, cell: Cell, index: number): ReactElement {
  const { bbox, font, content } = cell;
  const { size, color, isBold, isItalic, name } = font;
  const { fontFamily, fontWeight } = ComputeFontFamilyAndWeight(name);
  const [left, top, right, bottom] = bbox;
  const boxWidth = right - left;

  return (
    <text
      key={index}
      x={left}
      y={page.origin === 'TopLeft' ? top : page.height - top}
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
