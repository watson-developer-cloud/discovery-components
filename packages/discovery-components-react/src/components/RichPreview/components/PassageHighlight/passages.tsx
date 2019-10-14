import { useEffect, useState } from 'react';
import { QueryResultPassage } from '@disco-widgets/ibm-watson/discovery/v1';

// [ left, top, right, bottom ]
export type Bbox = [number, number, number, number];
export interface PageInfo {
  page_number: number;
  bbox: Bbox;
}

// TODO replace with interface from SDK once defined
interface TextMappings {
  pages: Array<{
    page_number: number;
    width: number;
    height: number;
    origin: 'TopLeft' | 'BottomLeft';
  }>;
  cells: Array<{
    page: {
      page_number: number;
      bbox: Bbox;
    };

    field: {
      name: string;
      index: number;
      // [ START, END ]
      span: [number, number];
    };
  }>;
}

// React hook for retrieving passage bbox data from document
export function usePassage(
  document?: any,
  passage?: QueryResultPassage
): ReadonlyArray<PageInfo> | null {
  const [pageInfo, setPageInfo] = useState<ReadonlyArray<PageInfo> | null>(null);

  useEffect((): void => {
    if (
      !passage ||
      !document ||
      !document.extracted_metadata ||
      !document.extracted_metadata.text_mappings
    ) {
      return;
    }

    const box = getPassagePageInfo(document.extracted_metadata.text_mappings, passage);
    if (box) {
      setPageInfo(box);
    }
  }, [document, passage]);

  return pageInfo;
}

const START = 0;
const END = 1;

/* eslint-disable @typescript-eslint/camelcase */
export function getPassagePageInfo(
  textMappings: TextMappings,
  passage: QueryResultPassage
): ReadonlyArray<PageInfo> | null {
  const { start_offset, end_offset, field } = passage;

  if (!start_offset || !end_offset) {
    return null;
  }

  return textMappings.cells
    .filter(cell => {
      const {
        field: { name, span }
      } = cell;
      return name === field && (span[START] <= end_offset && span[END] >= start_offset);
    })
    .map(cell => cell.page);
}
/* eslint-enable @typescript-eslint/camelcase */
