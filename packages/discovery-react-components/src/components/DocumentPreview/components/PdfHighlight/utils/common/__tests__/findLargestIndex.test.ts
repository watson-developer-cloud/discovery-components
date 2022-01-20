import { findLargestIndex } from '../findLargestIndex';

describe('findLargestIndex', () => {
  it('should find correct index', () => {
    expect(findLargestIndex(0, 100, index => (index <= 49 ? index : null))).toEqual({
      index: 49,
      value: 49
    });
    expect(findLargestIndex(0, 100, index => (index <= 50 ? index : null))).toEqual({
      index: 50,
      value: 50
    });
    expect(findLargestIndex(0, 100, index => (index <= 51 ? index : null))).toEqual({
      index: 51,
      value: 51
    });
  });

  it('should find correct index at the edge of the range', () => {
    expect(findLargestIndex(0, 100, index => (index === 0 ? index : null))).toEqual({
      index: 0,
      value: 0
    });
    expect(findLargestIndex(0, 100, index => (index <= 150 ? index : null))).toEqual({
      index: 99,
      value: 99
    });
  });

  it('should find correct index in a range of 1 width', () => {
    expect(findLargestIndex(0, 1, _ => true)).toEqual({
      index: 0,
      value: true
    });
  });

  it('should return null for empty ranges', () => {
    expect(findLargestIndex(0, 0, _ => true)).toBeNull();
  });

  it('should return null when no match in the range', () => {
    expect(findLargestIndex(0, 100, _ => null)).toBeNull();
    expect(findLargestIndex(0, 100, index => (index <= -50 ? index : null))).toBeNull();
    expect(findLargestIndex(0, 1, _ => null)).toBeNull();
  });
});
