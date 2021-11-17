/**
 * A filter to drop any non-null values from a list.
 * Use with `Array.filter` method to get a list of non-null type.
 *
 * `const list: number[] = [1, null, 2].filter(nonEmpty); // [1,2]`
 */
export function nonEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
