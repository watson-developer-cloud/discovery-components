import { END } from '../../../../utils/textSpan';
import { TextLayoutCellBase } from '../textLayout/types';
import { TextNormalizer } from '../common/TextNormalizer';
import { CellProvider } from './CellProvider';

/**
 * Cell provider with normalization
 * @see CellProvider
 */
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

  /**
   * check whether this provider has another item to visit or not
   */
  hasNext(): boolean {
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

  /**
   * get the next value
   */
  getNextInfo(): { text: string; index: number } {
    return {
      text: this.current!.normalizer.normalizedText,
      index: this.current!.nextCellIndex
    };
  }

  /**
   * consume (mark as used) first n chars from the cursor
   * @return text layout cells on the consumed text
   */
  consume(length: number): TextLayoutCellBase[] {
    const rawSpan = this.current!.normalizer.toRaw([0, length]);
    const rawLength = this.current!.leadingSpaces + rawSpan[END];
    this.current = null;
    return this.cellProvider.consume(rawLength);
  }

  /**
   * mark the current cell skipped (when no match found in source)
   */
  skip() {
    this.current = null;
    this.cellProvider.skip();
  }

  /**
   * move the cursor to the top to reprocess remaining target cells
   */
  rewind() {
    this.current = null;
    this.cellProvider.rewind();
  }
}
