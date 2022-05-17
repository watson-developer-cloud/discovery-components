import { QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import { ProcessedDoc } from 'utils/document';
import { Location } from 'utils/document/processDoc';
import { getHighlightedTable } from '../tables';
import { isTable } from '../typeUtils';

describe('Table', () => {
  const tableLocation: Location = { begin: 100, end: 200 };
  const processedDoc: ProcessedDoc = {
    title: '',
    styles: '',
    tables: [
      {
        location: { begin: 0, end: 100 },
        bboxes: []
      },
      {
        location: tableLocation,
        bboxes: [
          {
            left: 0,
            right: 10,
            top: 0,
            bottom: 10,
            page: 1,
            className: '',
            location: tableLocation
          }
        ]
      },
      {
        location: { begin: 200, end: 300 },
        bboxes: []
      }
    ]
  };

  it('returns a table to be highlighted', () => {
    const tableHighlight1: QueryTableResult = {
      table: {
        location: { begin: 100, end: 200 }
      }
    };
    const tableHighlight2: QueryTableResult = {
      table: {
        location: { begin: 200, end: 210 }
      }
    };

    expect(getHighlightedTable(tableHighlight1, processedDoc)).toBe(processedDoc?.tables?.[1]);
    expect(getHighlightedTable(tableHighlight2, processedDoc)).toBe(processedDoc?.tables?.[2]);
    expect(getHighlightedTable(null, processedDoc)).toBeNull();
  });

  it('checks the validity of a table highlight', () => {
    const validTable: QueryTableResult = {
      table: {
        location: { begin: 100, end: 200 }
      }
    };
    const passage: QueryResultPassage = {
      passage_text: '5.21 Miscellaneous Costs',
      start_offset: 39611,
      end_offset: 39635,
      field: 'text'
    };

    expect(isTable(validTable)).toBeTruthy();
    expect(isTable(passage)).toBeFalsy();
    expect(isTable(null)).toBeFalsy();
  });
});
