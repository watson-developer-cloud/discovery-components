import { bboxGetSpanByRatio, isNextToEachOther } from '../bboxUtils';

describe('bboxGetSpanByRatio', () => {
  it('should return proper bbox for spans on text', () => {
    // text: '0123456789' -> highlight: '0123456789'
    expect(bboxGetSpanByRatio([0, 0, 10, 2], 10, [0, 10])).toEqual([0, 0, 10, 2]);
    // text: '0123456789' -> highlight: '23'
    expect(bboxGetSpanByRatio([0, 0, 10, 2], 10, [2, 4])).toEqual([2, 0, 4, 2]);
    // text: '012345' -> highlight: '23'
    expect(bboxGetSpanByRatio([0, 0, 10, 2], 5, [2, 4])).toEqual([4, 0, 8, 2]);
  });
});

describe('isSideBySideOnLine', () => {
  it('should return true for side-by-side boxes', () => {
    expect(isNextToEachOther([0, 0, 5, 2], [5, 0, 10, 2])).toBeTruthy();
  });
  it('should return true for horizontally overlapped boxes', () => {
    expect(isNextToEachOther([0, 0, 5, 3], [4, 0, 10, 3])).toBeTruthy();
  });
  it('should return false when boxes are not vertically aligned', () => {
    expect(isNextToEachOther([0, 0, 5, 2], [5, 1, 10, 3])).toBeFalsy();
  });
  it('should return false when two boxes are apart from each other', () => {
    expect(isNextToEachOther([0, 0, 5, 2], [7, 0, 10, 2])).toBeFalsy();
  });
});
