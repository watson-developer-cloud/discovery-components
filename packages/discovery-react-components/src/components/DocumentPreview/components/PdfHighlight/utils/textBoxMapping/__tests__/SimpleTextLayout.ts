import { Bbox } from '../../../types';
import { BaseTextLayoutCell } from '../../textLayout/BaseTextLayout';
import { TextLayout } from '../../textLayout/types';

type LayoutItem = {
  bbox: Bbox;
  text: string;
};

export class SimpleTextLayout implements TextLayout<SimpleTextLayoutCell> {
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
