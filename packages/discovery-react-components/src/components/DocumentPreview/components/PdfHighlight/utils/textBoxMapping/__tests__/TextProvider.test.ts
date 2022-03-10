import { TextProvider } from '../TextProvider';

describe('TextProvider', () => {
  it('should find correct span for a text', () => {
    const fieldText = 'This is a sample sample text content.';
    const provider = new TextProvider(fieldText);

    const r = provider.getMatches('sample')[0];
    expect(r?.skipText).toBe('This is a ');
    expect(r?.span).toEqual([10, 16]);
    expect(r?.minHistoryDistance).toBe(10);
    expect(r?.textAfterEnd).toBe(' sample text content.');
  });

  it('should find correct span for a text when search range is specified', () => {
    const fieldText = 'This is a sample sample text content.';
    const provider = new TextProvider(fieldText);

    const r = provider.getMatches('sample', { searchSpan: [14, 25] })[0];
    expect(r?.skipText).toBe('This is a sample ');
    expect(r?.span).toEqual([17, 23]);
    expect(r?.minHistoryDistance).toBe(17);
    expect(r?.textAfterEnd).toBe(' text content.');
  });

  it('should find correct spans for a text after consuming a span', () => {
    const fieldText = 'This is a sample sample text content.';
    const matcher = new TextProvider(fieldText);

    // match and consumer a word
    let match = matcher.getMatches('sample');
    let r = match[0];
    matcher.consume(r?.span);

    // find span in former of remaining spans
    match = matcher.getMatches(' is');
    expect(match).toHaveLength(1);
    r = match[0];
    expect(r?.skipText).toBe('This');
    expect(r?.span).toEqual([4, 7]);
    expect(r?.minHistoryDistance).toBe(4);
    expect(r?.textAfterEnd).toBe(' a  sample text content.');

    // find span in latter of remaining spans
    match = matcher.getMatches('sample');
    expect(match).toHaveLength(1);
    r = match[0];
    expect(r?.skipText).toBe(' ');
    expect(r?.span).toEqual([17, 23]);
    expect(r?.minHistoryDistance).toBe(1);
    expect(r?.textAfterEnd).toBe(' text content.');

    // find spans in both of remaining spans
    match = matcher.getMatches('s');
    expect(match).toHaveLength(2);
    r = match[0];
    expect(r?.skipText).toBe('Thi');
    expect(r?.span).toEqual([3, 4]);
    expect(r?.minHistoryDistance).toBe(3);
    expect(r?.textAfterEnd).toBe(' is a  sample text content.');
    r = match[1];
    expect(r?.skipText).toBe(' ');
    expect(r?.span).toEqual([17, 18]);
    expect(r?.minHistoryDistance).toBe(1);
    expect(r?.textAfterEnd).toBe('ample text content.');
  });
});
