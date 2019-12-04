import { useEffect, useState } from 'react';
import get from 'lodash/get';
import { QueryResult, QueryResultPassage } from 'ibm-watson/discovery/v2';
import { getTextMappings } from '@DocumentPreview/utils/documentData';
import { CellPage, TextMappings } from '@DocumentPreview/types';
import { spansIntersect } from '@rootUtils/document/documentUtils';

// React hook for retrieving passage bbox data from document
export function usePassage(
  document?: QueryResult | null,
  passage?: QueryResultPassage
): ReadonlyArray<CellPage> | null {
  const [pageInfo, setPageInfo] = useState<ReadonlyArray<CellPage> | null>(null);

  useEffect((): void => {
    const textMappings = getTextMappings(document);
    if (!passage || !textMappings) {
      return;
    }

    const box = getPassagePageInfo(textMappings, passage);
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

  return get(textMappings, 'text_mappings', [])
    .filter(cell => {
      const {
        field: { name, span }
      } = cell;
      return (
        name === field &&
        spansIntersect(
          { begin: span[START], end: span[END] },
          { begin: start_offset, end: end_offset }
        )
      );
    })
    .map(cell => cell.page);
}
/* eslint-enable @typescript-eslint/camelcase */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPassage(obj: any): boolean {
  return 'passage_text' in obj;
}
