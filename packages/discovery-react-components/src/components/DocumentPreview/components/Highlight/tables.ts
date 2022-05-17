import { QueryTableResult } from 'ibm-watson/discovery/v2';
import { ProcessedDoc } from 'utils/document';
import { spansIntersect } from 'utils/document/documentUtils';

export function getHighlightedTable(
  highlight: QueryTableResult | null | undefined,
  processedDoc: ProcessedDoc | null | undefined
) {
  const location = highlight?.table?.location;
  if (location) {
    const { begin, end } = location;
    const table = processedDoc?.tables?.find(({ location }) =>
      spansIntersect(location, { begin, end })
    );
    if (table) {
      return table;
    }
  }
  return null;
}
