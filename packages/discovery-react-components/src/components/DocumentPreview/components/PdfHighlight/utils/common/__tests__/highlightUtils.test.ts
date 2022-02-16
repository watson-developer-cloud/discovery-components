import { QueryResultPassage } from 'ibm-watson/discovery/v2';
import { Table } from 'utils/document';
import { Location } from 'utils/document/processDoc';
import { DocumentBboxHighlight } from '../../../types';
import {
  convertToDocumentBboxHighlights,
  convertToDocumentFieldHighlights,
  getShapeFromBboxHighlight
} from '../highlightUtils';

describe('highlightUtils', () => {
  const highlightId = 'test-highlight-id';
  const className = 'test-class-name';
  const location: Location = { begin: 100, end: 300 };

  const passage: QueryResultPassage = {
    passage_text: '5.21 Miscellaneous Costs',
    start_offset: 39611,
    end_offset: 39635,
    field: 'text'
  };

  const table: Table = {
    location: { begin: 0, end: 100 },
    bboxes: [
      { page: 1, left: 0, right: 10, top: 0, bottom: 10, className: '', location },
      { page: 1, left: 10, right: 20, top: 0, bottom: 10, className: '', location },
      { page: 1, left: 20, right: 30, top: 0, bottom: 10, className: '', location },
      { page: 2, left: 0, right: 10, top: 0, bottom: 10, className: '', location },
      { page: 2, left: 10, right: 20, top: 0, bottom: 10, className: '', location }
    ]
  };

  const bboxHighlight: DocumentBboxHighlight = {
    id: highlightId,
    className,
    bboxes: [
      { page: 1, bbox: [0, 0, 10, 10] },
      { page: 1, bbox: [10, 0, 20, 10] },
      { page: 1, bbox: [20, 0, 30, 10] },
      { page: 2, bbox: [0, 0, 10, 10] },
      { page: 2, bbox: [10, 0, 20, 10] }
    ]
  };

  describe('convertToDocumentFieldHighlights', () => {
    it('should return proper field highlight', () => {
      expect(convertToDocumentFieldHighlights(passage, { id: highlightId, className })).toEqual([
        {
          id: highlightId,
          className,
          field: 'text',
          fieldIndex: 0,
          location: {
            begin: 39611,
            end: 39635
          }
        }
      ]);
    });
  });

  describe('convertToDocumentBboxHighlights', () => {
    it('should return proper bbox highlight', () => {
      expect(convertToDocumentBboxHighlights(table, { id: highlightId, className })).toEqual([
        bboxHighlight
      ]);
    });
  });

  describe('getShapeFromBboxHighlight', () => {
    it('should return proper bbox for spans on text', () => {
      expect(getShapeFromBboxHighlight([bboxHighlight], 1)).toEqual([
        {
          highlightId,
          className,
          boxes: [
            {
              isStart: true,
              isEnd: false,
              bbox: [0, 0, 10, 10]
            },
            {
              isStart: false,
              isEnd: false,
              bbox: [10, 0, 20, 10]
            },
            {
              isStart: false,
              isEnd: true,
              bbox: [20, 0, 30, 10]
            }
          ]
        }
      ]);
    });
  });
});
