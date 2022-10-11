import { QueryResult, QueryResultPassage } from 'ibm-watson/discovery/v2';
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

/**
 * Calculate array index and offset within the value at that index, given the "overall" offset.
 *
 * The value for document SDU fields can be either a single string (only for "text" field) or an
 * array of strings (every other field type). When generating offsets for passages, the field
 * value is treated as a single string -- if it's originally an array of strings, then the array
 * is first concatenated (with `\n` chars in between) and the "overall" offset generated.
 *
 * @param arr field value
 * @param offset start or end offset across _entire_ field (not within an individual array item)
 * @returns index of array item which contains `offset`, plus adjusted offset only within the array item
 */
function getIndexForOffset(
  arr: string[],
  offset: number
): { index: number; offset: number } | null {
  let found = false,
    index = 0;

  // find array index which contains offset
  while (!found && index < arr.length) {
    // `+ 1` here and below are used to take into account the newline char which is used
    // to separate each array item, when concatenating into a single string
    if (offset < arr[index].length + 1) {
      // `offset` is contained within this array item
      found = true;
    } else {
      offset -= arr[index].length + 1;
      index++;
    }
  }

  if (!found) {
    // `fieldIndex` was bigger than length, but offset was still not found. Most likely
    // this means that fn was called with incompatible document and passage data (i.e.
    // either document or passage was changed, but the other hasn't yet updated).
    return null;
  }

  return { index, offset };
}

export function convertToDocumentFieldHighlights(
  passage: QueryResultPassage,
  document?: QueryResult
): DocumentFieldHighlight[] | null {
  let fieldIndex = 0,
    begin = passage.start_offset || 0,
    end = passage.end_offset || 0;

  if (document && passage.field) {
    const fieldValue = document[passage.field] as string[];
    if (Array.isArray(fieldValue)) {
      let beginIndex, endIndex;

      let indexForOffset = getIndexForOffset(fieldValue, begin);
      if (!indexForOffset) {
        // `fieldIndex` was bigger than length, but offset was still not found. Most likely
        // this means that fn was called with incompatible document and passage data (i.e.
        // either document or passage was changed, but the other hasn't yet updated).
        return null;
      } else {
        beginIndex = indexForOffset.index;
        begin = indexForOffset.offset;
      }

      end -= (passage.start_offset || 0) - begin;
      indexForOffset = getIndexForOffset(fieldValue.slice(beginIndex), end);
      if (!indexForOffset) {
        // `begin` offset was found, but not `end` offset? Shouldn't happen. Rather than just
        // returning `null` for everything since we found `begin`, we'll return the last index
        // as `end`.
        endIndex = fieldValue.length - 1;
        end = fieldValue[endIndex].length - 1;
      } else {
        endIndex = beginIndex + indexForOffset.index;
        end = indexForOffset.offset;
      }

      // return index containing passage
      const res = [
        {
          id: DEFAULT_HIGHLIGHT_ID + '0',
          field: passage.field,
          fieldIndex: beginIndex,
          location: {
            begin,
            end: fieldValue[beginIndex].length
          }
        }
      ];

      if (beginIndex === endIndex) {
        // if begin and end of passage are all within single field array item, then update `end` and return
        res[0].location.end = end;
      } else {
        // otherwise, create another object to contain passage end
        res.push({
          id: DEFAULT_HIGHLIGHT_ID + '1',
          field: passage.field,
          fieldIndex: endIndex,
          location: {
            begin: 0,
            end
          }
        });
      }

      return res;
    }
  }

  return [
    {
      id: DEFAULT_HIGHLIGHT_ID,
      field: passage.field || '',
      fieldIndex,
      location: {
        begin,
        end
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
          isEnd: index === arr.length - 1
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
