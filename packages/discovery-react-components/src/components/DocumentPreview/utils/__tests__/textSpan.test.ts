import {
  spanCompare,
  spanContains,
  spanFromSubSpan,
  spanGetSubSpan,
  spanGetText,
  spanIncludesIndex,
  spanIntersection,
  spanIntersects,
  spanLen
} from '../textSpan';
import { TextSpan } from '../../types';

describe('spanGetText', () => {
  it('should return valid span text', () => {
    expect(spanGetText('0123456789', [3, 5])).toBe('34');
    expect(spanGetText('0123456789', [0, 10])).toBe('0123456789');
  });
  it('should return null for null text', () => {
    expect(spanGetText(null, [3, 5])).toBe(null);
  });
  it('should return empty text for empty or negative span', () => {
    expect(spanGetText('0123456789', [0, 0])).toBe('');
    expect(spanGetText('0123456789', [5, 3])).toBe('');
  });
  it('should return text span for negative or large indices', () => {
    expect(spanGetText('0123456789', [-10, 20])).toBe('0123456789');
  });
});

describe('spanLen', () => {
  it('should return span length', () => {
    expect(spanLen([5, 10])).toBe(5);
    expect(spanLen([10, 10])).toBe(0);
  });
  it('should return zero for negative spans', () => {
    expect(spanLen([10, 5])).toBe(0);
  });
});

describe('spanIntersects', () => {
  it('should properly distinguish span intersection', () => {
    expect(spanIntersects([10, 19], [20, 30])).toBeFalsy();
    expect(spanIntersects([10, 20], [20, 30])).toBeFalsy();
    expect(spanIntersects([10, 21], [20, 30])).toBeTruthy();
    expect(spanIntersects([29, 40], [20, 30])).toBeTruthy();
    expect(spanIntersects([30, 41], [20, 30])).toBeFalsy();
    expect(spanIntersects([31, 40], [20, 30])).toBeFalsy();

    expect(spanIntersects([25, 26], [20, 30])).toBeTruthy();

    expect(spanIntersects([20, 30], [10, 19])).toBeFalsy();
    expect(spanIntersects([20, 30], [10, 20])).toBeFalsy();
    expect(spanIntersects([20, 30], [10, 21])).toBeTruthy();
    expect(spanIntersects([20, 30], [29, 40])).toBeTruthy();
    expect(spanIntersects([20, 30], [30, 41])).toBeFalsy();
    expect(spanIntersects([20, 30], [31, 40])).toBeFalsy();
  });
});

describe('spanIncludesIndex', () => {
  it('should return true for indices inside a span', () => {
    expect(spanIncludesIndex([10, 20], 10)).toBeTruthy();
    expect(spanIncludesIndex([10, 20], 15)).toBeTruthy();
    expect(spanIncludesIndex([10, 20], 19)).toBeTruthy();
  });
  it('should return false for indices outside a span', () => {
    expect(spanIncludesIndex([10, 20], 9)).toBeFalsy();
    expect(spanIncludesIndex([10, 20], 20)).toBeFalsy();
    expect(spanIncludesIndex([10, 20], 21)).toBeFalsy();
  });
});

describe('spanContains', () => {
  it('should return true when a span contains other span', () => {
    expect(spanContains([10, 20], [15, 18])).toBeTruthy();
    expect(spanContains([10, 20], [10, 18])).toBeTruthy();
    expect(spanContains([10, 20], [15, 20])).toBeTruthy();
  });
  it("should return true when a span doesn't contain other span", () => {
    expect(spanContains([10, 20], [9, 10])).toBeFalsy();
    expect(spanContains([10, 20], [9, 18])).toBeFalsy();
    expect(spanContains([10, 20], [15, 21])).toBeFalsy();
    expect(spanContains([10, 20], [21, 30])).toBeFalsy();
  });
});

describe('spanIntersection', () => {
  it('should return span intersection', () => {
    expect(spanIntersection([10, 20], [15, 18])).toEqual([15, 18]);
    expect(spanIntersection([10, 20], [10, 18])).toEqual([10, 18]);
    expect(spanIntersection([10, 20], [15, 25])).toEqual([15, 20]);
  });
  it('should return a span when the span is contained in another span', () => {
    const a = [10, 20] as TextSpan;
    expect(spanIntersection(a, [0, 30])).toBe(a);
    expect(spanIntersection(a, [10, 21])).toBe(a);
    expect(spanIntersection([0, 30], a)).toBe(a);
    expect(spanIntersection([10, 20], a)).toBe(a);
  });
});

describe('spanFromSubSpan', () => {
  it('should return a span that represents a sub-span (span in span) in a base span', () => {
    expect(spanFromSubSpan([10, 20], [0, 5])).toEqual([10, 15]);
    expect(spanFromSubSpan([10, 20], [5, 10])).toEqual([15, 20]);
    expect(spanFromSubSpan([10, 20], [5, 20])).toEqual([15, 20]);
  });
});

describe('spanGetSubSpan', () => {
  it('should return a span on a base span', () => {
    expect(spanGetSubSpan([10, 20], [10, 15])).toEqual([0, 5]);
    expect(spanGetSubSpan([10, 20], [15, 20])).toEqual([5, 10]);
  });
  it('should return an empty span when given spans has no intersection', () => {
    expect(spanLen(spanGetSubSpan([10, 20], [0, 5]))).toBe(0);
    expect(spanLen(spanGetSubSpan([10, 20], [20, 25]))).toBe(0);
  });
});

describe('spanCompare', () => {
  it('should return zero for same spans', () => {
    expect(spanCompare([0, 0], [0, 0])).toBe(0);
    expect(spanCompare([10, 20], [10, 20])).toBe(0);
  });
  it('should return negative for spans before another', () => {
    expect(spanCompare([10, 20], [11, 20]) < 0).toBeTruthy();
    expect(spanCompare([10, 20], [10, 21]) < 0).toBeTruthy();
  });
  it('should return positive for spans after another', () => {
    expect(spanCompare([10, 20], [9, 20]) > 0).toBeTruthy();
    expect(spanCompare([10, 20], [10, 19]) > 0).toBeTruthy();
  });
});
