import { useEffect, useState } from 'react';
import { QueryResult, QueryResultPassage } from '@disco-widgets/ibm-watson/discovery/v1';
import { CellPage, TextMappings } from '../../types';

// React hook for retrieving passage bbox data from document
export function usePassage(
  document?: QueryResult,
  passage?: QueryResultPassage
): ReadonlyArray<CellPage> | null {
  const [pageInfo, setPageInfo] = useState<ReadonlyArray<CellPage> | null>(null);

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
): ReadonlyArray<CellPage> | null {
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
