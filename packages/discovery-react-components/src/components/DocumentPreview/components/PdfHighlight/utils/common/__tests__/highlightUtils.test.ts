import { QueryResultPassage } from 'ibm-watson/discovery/v2';
import { Table } from 'utils/document';
import { Location } from 'utils/document/processDoc';
import { DocumentBboxHighlight } from '../../../types';
import {
  convertToDocumentBboxHighlights,
  convertToDocumentFieldHighlights,
  getShapeFromBboxHighlight
} from '../highlightUtils';
import documentQandA from '../../../../../__fixtures__/QandA.pdf.json';

describe('highlightUtils', () => {
  const highlightId = 'test-highlight-id';
  const className = 'test-class-name';
  const location: Location = { begin: 100, end: 300 };

  const textPassage: QueryResultPassage = {
    passage_text: '5.21 Miscellaneous Costs',
    start_offset: 39611,
    end_offset: 39635,
    field: 'text'
  };

  const answerPassage1: QueryResultPassage = {
    passage_text: 'Smart Document Understanding',
    start_offset: 7503,
    end_offset: 7531,
    field: 'answer'
  };

  const answerPassage2: QueryResultPassage = {
    passage_text:
      'You can use the <em>Smart</em> <em>Document</em> <em>Understanding</em> tool to teach Discovery about sections in your <em>documents</em> with distinct format and structure that you want Discovery to index. You can define a new field, and then annotate <em>documents</em> to train Discovery to <em>understand</em> what type of information is typically stored in the field. For more information, see Using <em>Smart</em> <em>Document</em> <em>Understanding</em>.',
    start_offset: 7487,
    end_offset: 7867,
    field: 'answer'
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
    it('should return proper field highlight against `text` field', () => {
      expect(convertToDocumentFieldHighlights(textPassage)).toEqual([
        {
          id: 'highlight',
          field: 'text',
          fieldIndex: 0,
          location: {
            begin: 39611,
            end: 39635
          }
        }
      ]);
    });

    it('should return proper field highlight against `answers` field (single-line)', () => {
      expect(convertToDocumentFieldHighlights(answerPassage1, documentQandA)).toEqual([
        {
          id: 'highlight0',
          field: 'answer',
          fieldIndex: 52,
          location: {
            begin: 16,
            end: 44
          }
        }
      ]);
    });

    it('should return proper field highlight against `answers` field (multi-line)', () => {
      expect(convertToDocumentFieldHighlights(answerPassage2, documentQandA)).toEqual([
        {
          id: 'highlight0',
          field: 'answer',
          fieldIndex: 52,
          location: {
            begin: 0,
            end: 344
          }
        },
        {
          id: 'highlight1',
          field: 'answer',
          fieldIndex: 53,
          location: {
            begin: 0,
            end: 35
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
