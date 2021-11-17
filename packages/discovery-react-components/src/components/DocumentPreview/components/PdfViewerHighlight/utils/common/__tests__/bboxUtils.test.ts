import { bboxGetSpanByRatio, bboxIntersects, isNextToEachOther } from '../bboxUtils';

describe('bboxIntersects', () => {
  it('should return true when boxes intersect', () => {
    expect(bboxIntersects([10, 10, 20, 20], [15, 15, 25, 25])).toBeTruthy();
  });

  it("should return false when boxes don't intersect", () => {
    expect(bboxIntersects([10, 10, 20, 20], [15, 25, 25, 35])).toBeFalsy();
  });

  it('should return false when one box is on another', () => {
    expect(bboxIntersects([10, 10, 20, 20], [20, 10, 30, 20])).toBeFalsy();
    expect(bboxIntersects([10, 10, 20, 20], [0, 10, 10, 20])).toBeFalsy();
    expect(bboxIntersects([10, 10, 20, 20], [10, 20, 20, 30])).toBeFalsy();
    expect(bboxIntersects([10, 10, 20, 20], [10, 0, 20, 10])).toBeFalsy();
  });
});

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
  it('should return false when boxes are not vertically aligned', () => {
    expect(isNextToEachOther([0, 0, 5, 2], [5, 1, 10, 3])).toBeFalsy();
  });
  it('should return false when two boxes are apart from each other', () => {
    expect(isNextToEachOther([0, 0, 5, 2], [7, 0, 10, 2])).toBeFalsy();
  });
});
