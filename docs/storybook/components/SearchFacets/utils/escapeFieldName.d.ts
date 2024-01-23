/**
 * Escape "special" characters in field names.
 * Note: this method does not escape already escaped chars.
 *
 * @param fieldName
 * @returns escaped field name string
 */
export declare function escapeFieldName(fieldName: string): string;
/**
 * Unescaped any string returned from `escapeFieldName`
 * @param fieldName
 * @returns unescaped field name string
 */
export declare function unescapeFieldName(fieldName: string): string;
