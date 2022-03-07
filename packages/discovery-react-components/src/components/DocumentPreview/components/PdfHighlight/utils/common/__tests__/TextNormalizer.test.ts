import { TextSpan } from '../../../types';
import { TextNormalizer } from '../TextNormalizer';

describe('TextNormalizer', () => {
  it('should do nothing with text that does not have any chars to normalize', () => {
    const fieldText = 'This is a sample text content.';
    const expectedNormalizedText = fieldText;

    const matcher = new TextNormalizer(fieldText);
    expect(matcher.rawText).toEqual(fieldText);
    expect(matcher.normalizedText).toEqual(expectedNormalizedText);
    expect(matcher.normalizationMappings).toHaveLength(1);

    let spans: TextSpan[] = [
      [0, 10], // start from beginning
      [3, 10], // start from one before space
      [4, 10], // start from space
      [5, 10], // start from one character after space
      [10, 20], // end at one char before space
      [10, 21], // end at space
      [10, 22], // end at one char after space,
      [10, fieldText.length]
    ];
    for (const span of spans) {
      expect(matcher.toNormalized(span)).toEqual(span);
      expect(matcher.toRaw(span)).toEqual(span);
    }
  });

  it('should normalize text with one long blank', () => {
    const fieldText = 'This    is a sample text content.';
    const expectedNormalizedText = 'This is a sample text content.';

    const matcher = new TextNormalizer(fieldText);
    expect(matcher.rawText).toEqual(fieldText);
    expect(matcher.normalizedText).toEqual(expectedNormalizedText);
    expect(matcher.normalizationMappings).toHaveLength(3);

    // test begin
    expect(matcher.toNormalized([0, 10])).toEqual([0, 7]);
    expect(matcher.toNormalized([3, 10])).toEqual([3, 7]); // one before blank
    expect(matcher.toNormalized([4, 10])).toEqual([4, 7]);
    expect(matcher.toNormalized([5, 10])).toEqual([4, 7]);
    expect(matcher.toNormalized([6, 10])).toEqual([5, 7]);
    expect(matcher.toNormalized([7, 10])).toEqual([5, 7]);
    expect(matcher.toNormalized([8, 10])).toEqual([5, 7]);
    expect(matcher.toNormalized([9, 10])).toEqual([6, 7]); // one after blank
    // test end
    expect(matcher.toNormalized([0, 3])).toEqual([0, 3]); // one before blank
    expect(matcher.toNormalized([0, 4])).toEqual([0, 4]);
    expect(matcher.toNormalized([0, 5])).toEqual([0, 4]);
    expect(matcher.toNormalized([0, 6])).toEqual([0, 5]);
    expect(matcher.toNormalized([0, 7])).toEqual([0, 5]);
    expect(matcher.toNormalized([0, 8])).toEqual([0, 5]);
    expect(matcher.toNormalized([0, 9])).toEqual([0, 6]); // one after blank
    // last
    expect(matcher.toNormalized([20, fieldText.length])).toEqual([
      17,
      expectedNormalizedText.length
    ]);

    // test begin
    expect(matcher.toRaw([0, 7])).toEqual([0, 10]);
    expect(matcher.toRaw([3, 7])).toEqual([3, 10]); // one before blank
    expect(matcher.toRaw([4, 7])).toEqual([4, 10]);
    expect(matcher.toRaw([5, 7])).toEqual([8, 10]); // one after blank
    // test end
    expect(matcher.toRaw([0, 3])).toEqual([0, 3]); // one before blank
    expect(matcher.toRaw([0, 4])).toEqual([0, 4]);
    expect(matcher.toRaw([0, 5])).toEqual([0, 8]); // one after blank
    expect(matcher.toRaw([0, 6])).toEqual([0, 9]); // two after blank
    // last
    expect(matcher.toRaw([17, expectedNormalizedText.length])).toEqual([20, fieldText.length]);
  });

  it('should normalize text with multiple long blanks', () => {
    const fieldText = 'This    is a     sample    text content.    ';
    const expectedNormalizedText = 'This is a sample text content. ';

    const matcher = new TextNormalizer(fieldText);
    expect(matcher.normalizedText).toEqual(expectedNormalizedText);
    expect(matcher.toNormalized([9, 29] /* s a sample te */)).toEqual([6, 19]);
    expect(matcher.toRaw([10, 16] /* sample */)).toEqual([17, 23]);
  });

  it('should normalize quotes', () => {
    const fieldText = 'This is “double-quoted”. This is ‘single-quoted’.';
    const expectedNormalizedText = 'This is "double-quoted". This is \'single-quoted\'.';

    const matcher = new TextNormalizer(fieldText);
    expect(matcher.normalizedText).toEqual(expectedNormalizedText);
    expect(matcher.toNormalized([9, 29])).toEqual([9, 29]);
    expect(matcher.toRaw([10, 16])).toEqual([10, 16]);
    for (let i = 0; i < fieldText.length; i += 1) {
      expect(matcher.toNormalized([0, i + 1])).toEqual([0, i + 1]);
      expect(matcher.toNormalized([i, fieldText.length])).toEqual([i, fieldText.length]);
      expect(matcher.toRaw([0, i + 1])).toEqual([0, i + 1]);
      expect(matcher.toRaw([i, fieldText.length])).toEqual([i, fieldText.length]);
    }
  });

  it('should normalize surrogate pairs', () => {
    const fieldText = 'This is emoji 😁.';
    const expectedNormalizedText = 'This is emoji _.';

    const matcher = new TextNormalizer(fieldText);
    expect(matcher.normalizedText).toEqual(expectedNormalizedText);
    expect(matcher.toNormalized([14, 16])).toEqual([14, 15]);
    expect(matcher.toRaw([14, 15])).toEqual([14, 16]);
  });

  it('should normalize diacritical marks', () => {
    const fieldText = 'àáâãäåçèéêëìíîïñòóôõöùúûüýÿæœ';
    const expectedNormalizedText = 'aaaaaaceeeeiiiinooooouuuuyyæœ';

    const matcher = new TextNormalizer(fieldText);
    expect(matcher.normalizedText).toEqual(expectedNormalizedText);

    const fieldText2 = fieldText.normalize('NFD'); // à: U+00E0 -> U+0061 U+0300
    expect(fieldText2.length).toBe(fieldText.length * 2 - 2 /* æœ are not changed */);
    const matcher2 = new TextNormalizer(fieldText2);
    expect(matcher2.normalizedText).toEqual(expectedNormalizedText);
  });

  it('should normalize null characters', () => {
    const fieldText = '\x00This contains \x00null\x00 characters.';
    const expectedNormalizedText = 'This contains null characters.';

    const matcher = new TextNormalizer(fieldText);
    expect(matcher.normalizedText).toEqual(expectedNormalizedText);
    expect(matcher.toNormalized([0, 21])).toEqual([0, 18]); // 3 null chars are removed from the span
    expect(matcher.toRaw([10, 18])).toEqual([11, 21]);
  });

  describe('range conversion', () => {
    it('should return mapped indices for negative indices and greater indices than text length', () => {
      const matcher = new TextNormalizer('1234567890');
      expect(matcher.toNormalized([-10, 20])).toEqual([-10, 20]);
      expect(matcher.toNormalized([20, 30])).toEqual([20, 30]);
      expect(matcher.toRaw([-10, 20])).toEqual([-10, 20]);
      expect(matcher.toRaw([20, 30])).toEqual([20, 30]);
    });

    it('should return mapped indices for negative indices and greater indices than normalized text length', () => {
      const matcher = new TextNormalizer('          ');
      expect(matcher.toNormalized([-10, 20])).toEqual([-10, 11]);
      expect(matcher.toNormalized([20, 30])).toEqual([11, 21]);
      expect(matcher.toRaw([-10, 20])).toEqual([-10, 29]);
      expect(matcher.toRaw([20, 30])).toEqual([29, 39]);
    });
  });
});
