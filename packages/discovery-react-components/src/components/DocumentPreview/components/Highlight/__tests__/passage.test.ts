import docJson from 'components/DocumentPreview/__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import { usePassage } from '../passages';
import { isPassage } from '../typeUtils';
import { QueryResultPassage } from 'ibm-watson/discovery/v2';
import { renderHook } from '@testing-library/react-hooks';

describe('Passage', () => {
  it('returns passage bbox data from document', () => {
    const passage = {
      passage_text: '5.21 Miscellaneous Costs',
      start_offset: 39611,
      end_offset: 39635,
      field: 'text'
    };

    const { result } = renderHook(() => usePassage(docJson, passage as QueryResultPassage));

    const resultBbox = [
      { page_number: 13, bbox: [54, 256.6070556640625, 558.1146850585938, 316.8000044822693] }
    ];

    expect(result.current).toEqual(resultBbox);
  });

  it('checks the validity of a passage', () => {
    const validPassage = {
      passage_text: '5.21 Miscellaneous Costs',
      start_offset: 39611,
      end_offset: 39635,
      field: 'text'
    };

    const invalidPassage = {
      start_offset: 39611,
      end_offset: 39635,
      field: 'text'
    };

    expect(isPassage(validPassage)).toBeTruthy();

    expect(isPassage(invalidPassage)).toBeFalsy();
  });
});
