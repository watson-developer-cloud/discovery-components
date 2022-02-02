import { QueryResultPassage } from 'ibm-watson/discovery/v2';
import { Table } from 'utils/document';
import { nonEmpty } from 'utils/nonEmpty';
import {
  Bbox,
  DocumentBboxHighlight,
  DocumentFieldHighlight,
  HighlightShape,
  HighlightShapeBox
} from '../../types';

export const DEFAULT_HIGHLIGHT_ID = 'highlight';

export function convertToDocumentFieldHighlights(
  highlight: QueryResultPassage,
  { id = DEFAULT_HIGHLIGHT_ID, className }: { id?: string; className?: string } = {}
): DocumentFieldHighlight[] {
  return [
    {
      id,
      className,
      field: highlight.field || '',
      fieldIndex: 0,
      location: {
        begin: highlight.start_offset || 0,
        end: highlight.end_offset || 0
      }
    }
  ];
}

export function convertToDocumentBboxHighlights(
  table: Table,
  { id = DEFAULT_HIGHLIGHT_ID, className }: { id?: string; className?: string } = {}
): DocumentBboxHighlight[] {
  return [
    {
      id,
      className,
      bboxes: table.bboxes.map(({ left, right, top, bottom, page }) => ({
        page,
        bbox: [left, top, right, bottom] as Bbox
      }))
    }
  ];
}

export function getShapeFromBboxHighlight(
  highlights: DocumentBboxHighlight[],
  page: number
): HighlightShape[] {
  return highlights
    .map(hl => {
      const boxes: HighlightShapeBox[] = hl.bboxes
        .filter(b => b.page === page)
        .map((b, index, arr) => ({
          bbox: b.bbox,
          isStart: index === 0,
          isEnd: index === arr.length
        }));
      return boxes.length > 0
        ? {
            highlightId: hl.id || `${boxes[0].bbox[0]}__${boxes[0].bbox[1]}`,
            className: hl.className,
            boxes
          }
        : null;
    })
    .filter(nonEmpty);
}
