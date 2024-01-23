/**
 * Find the largest index that satisfies the matchFn and the value of matchFn then
 * @param begin begin index of the range. inclusive
 * @param end end index of the rage. exclusive
 * @param matchFn
 */
export declare function findLargestIndex<V>(begin: number, end: number, matchFn: (index: number) => V | null, splitMid?: boolean): {
    index: number;
    value: V;
} | null;
