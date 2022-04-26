import { Bbox } from '../../../types';
import { BaseTextLayoutCell } from '../../textLayout/BaseTextLayout';
import { TextLayout } from '../../textLayout/types';
import { getTextBoxMappings } from '../getTextBoxMapping';

type LayoutItem = {
  bbox: Bbox;
  text: string;
};

class SimpleTextLayout implements TextLayout<SimpleTextLayoutCell> {
  readonly cells: SimpleTextLayoutCell[];

  constructor(items: LayoutItem[]) {
    this.cells = items.map(
      (item, index) => new SimpleTextLayoutCell(this, index, item.bbox, item.text)
    );
  }

  cellAt(id: number) {
    return this.cells[id];
  }
}

class SimpleTextLayoutCell extends BaseTextLayoutCell<SimpleTextLayout> {
  constructor(parent: SimpleTextLayout, id: number, bbox: Bbox, text: string) {
    super({ parent, id, pageNum: 1, bbox, text });
  }
}

function bbox(x: number, y: number, w = 1, h = 1): Bbox {
  return [x, y, x + w, y + h];
}

describe('getTextBoxMapping', () => {
  it('should map longer line first', () => {
    const source = new SimpleTextLayout([
      // text_mappings box
      { text: 'abc def abc def ghi', bbox: bbox(0, 0, 2, 2) }
    ]);
    const target = new SimpleTextLayout([
      // 1st line (abc def)
      { bbox: bbox(0, 0), text: 'abc def' },
      // 2nd line (abc def ghi)
      { bbox: bbox(0, 1), text: 'abc ' },
      { bbox: bbox(1, 1), text: 'def ghi' }
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

  it('should map text after long match properly', () => {
    const source = new SimpleTextLayout([
      // text_mappings box
      {
        text: '1 abc def ghi jkl 2 abc def ghi jkl 3 abc def ghi jkl 4 abc def ghi jkl',
        bbox: bbox(0, 0, 2, 4)
      }
    ]);
    const target = new SimpleTextLayout([
      // 1st line
      { bbox: bbox(0, 0), text: '1 abc def ghi' },
      { bbox: bbox(1, 0), text: 'jkl' },
      // 2nd line
      { bbox: bbox(0, 1), text: '2 abc def ghi' },
      { bbox: bbox(1, 1), text: 'jkl' },
      // 3nd line
      { bbox: bbox(0, 2), text: '3 abc def ghi' },
      { bbox: bbox(1, 2), text: 'jkl' },
      // 4th line
      { bbox: bbox(0, 3), text: '4 abc def ghi' },
      { bbox: bbox(1, 3), text: 'jkl' }
    ]);
    const mapping = getTextBoxMappings(source, target);

    // verify the mapping result of the 1st 'jkl' in the source
    const result1 = mapping.apply(source.cellAt(0).getPartial([14, 17]));
    expect(result1).toHaveLength(1);
    const normalized1 = result1[0].cell?.getNormalized();
    expect(normalized1?.cell).toBe(target.cellAt(1)); // mapped to first cell in target
  });
});
