import { Bbox } from '../../../types';
import { getTextBoxMappings } from '../getTextBoxMapping';
import { SimpleTextLayout } from './SimpleTextLayout';

function genBbox(x: number, y: number, w = 1, h = 1): Bbox {
  return [x, y, x + w, y + h];
}

describe('getTextBoxMapping', () => {
  it('should map longer text first', () => {
    const source = new SimpleTextLayout([
      // text_mappings box
      { text: 'abc def abc def ghi', bbox: genBbox(0, 0, 2, 2) }
    ]);
    const target = new SimpleTextLayout([
      // 1st line (abc def)
      { bbox: genBbox(0, 0), text: 'abc def' },
      // 2nd line (abc def ghi)
      { bbox: genBbox(0, 1), text: 'abc ' },
      { bbox: genBbox(1, 1), text: 'def ghi' }
    ]);
    const mapping = getTextBoxMappings(source, target);

    // verify the mapping result of the 1st 'abc' in the source
    const result1 = mapping.apply(source.cellAt(0).getPartial([0, 3]));
    expect(result1).toHaveLength(1);
    const normalized1 = result1[0].cell?.getNormalized();
    expect(normalized1?.cell).toBe(target.cellAt(0)); // mapped to first cell in target
    expect(normalized1?.span).toEqual([0, 3]); // mapped to the span [0, 3] in the 2nd cell

    // verify the mapping result of the 2nd 'abc' in the source
    const result2 = mapping.apply(source.cellAt(0).getPartial([8, 11]));
    expect(result2).toHaveLength(1);
    const normalized2 = result2[0].cell?.getNormalized();
    expect(normalized2?.cell).toBe(target.cellAt(1)); // mapped to 2nd cell in target
    expect(normalized2?.span).toEqual([0, 3]); // mapped to the span [0, 3] in the 2nd cell
  });
});
