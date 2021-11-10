import { TextLayoutCellBase } from '../textLayout/types';
import { TextNormalizer } from '../common/TextNormalizer';
import { CellProvider } from './CellProvider';
import { END } from '../common/textSpanUtils';

export class MappingTargetBoxProvider {
  private readonly cellProvider: CellProvider;
  private current: {
    nextCellIndex: number;
    normalizer: TextNormalizer;
    leadingSpaces: number;
  } | null = null;

  constructor(cells: TextLayoutCellBase[]) {
    this.cellProvider = new CellProvider(cells);
  }

  hasNext() {
    while (this.cellProvider.hasNext()) {
      const { texts, nextCellIndex } = this.cellProvider.getNextText();
      const text = texts.join('');
      const leadingSpaces = text.match(/^\s*/)?.[0].length ?? 0;
      const trimmedText = text.substring(leadingSpaces);
      if (trimmedText.length > 0) {
        const normalizer = new TextNormalizer(trimmedText);
        this.current = {
          nextCellIndex,
          normalizer,
          leadingSpaces
        };
        return true;
      }
      this.cellProvider.skip(); // skip blank only
    }
    this.current = null;
    return false;
  }

  getNextInfo() {
    return {
      text: this.current!.normalizer.normalizedText,
      index: this.current!.nextCellIndex
    };
  }

  consume(length: number) {
    const rawSpan = this.current!.normalizer.toRaw([0, length]);
    const rawLength = this.current!.leadingSpaces + rawSpan[END];
    this.current = null;
    return this.cellProvider.consume(rawLength);
  }

  skip() {
    this.current = null;
    this.cellProvider.skip();
  }
}
