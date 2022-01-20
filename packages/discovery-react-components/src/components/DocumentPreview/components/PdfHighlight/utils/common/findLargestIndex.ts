/**
 * Find the largest index that satisfies the matchFn and the value of matchFn then
 * @param begin begin index of the range. inclusive
 * @param end end index of the rage. exclusive
 * @param matchFn
 */
export function findLargestIndex<V>(
  begin: number,
  end: number,
  matchFn: (index: number) => V | null,
  splitMid?: boolean
): { index: number; value: V } | null {
  if (end - begin < 1) return null;

  const midIndex = splitMid ? begin + Math.floor((end - begin) / 2) : end - 1;
  const value = matchFn(midIndex);
  if (!(value == null)) {
    if (end - (midIndex + 1) > 0) {
      const r = findLargestIndex(midIndex + 1, end, matchFn, true);
      if (r) return r;
      else return { index: midIndex, value };
    } else {
      return { index: midIndex, value };
    }
  } else {
    if (midIndex - begin > 0) {
      const r = findLargestIndex(begin, midIndex, matchFn, true);
      if (r) return r;
      else return null;
    } else {
      return null;
    }
  }
}
