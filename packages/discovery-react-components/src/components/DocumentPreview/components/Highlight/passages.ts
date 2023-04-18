import { useEffect, useState } from 'react';
import { QueryResult, QueryResultPassage } from 'ibm-watson/discovery/v2';
import { getTextMappings } from 'components/DocumentPreview/utils/documentData';
import { CellPage, TextMappings } from 'components/DocumentPreview/types';
import { spansIntersect } from 'utils/document/documentUtils';

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

export function getPassagePageInfo(
  textMappings: TextMappings,
  passage: QueryResultPassage
): ReadonlyArray<CellPage> | null {
  const { start_offset, end_offset, field } = passage;

  if (typeof start_offset !== 'number' || typeof end_offset !== 'number') {
    return null;
  }

  const mappings = textMappings?.text_mappings || [];
  return mappings
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
