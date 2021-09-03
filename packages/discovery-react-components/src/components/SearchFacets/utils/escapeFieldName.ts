/**
 * Before field names can be used as part of an aggregation query, the following
 * characters within the name must be escaped: ^ ~ > < : ! , | ( ) [ ] *
 * Note: this method does not escape already escaped chars.
 *
 * @param fieldName
 * @returns escaped field name string
 */
export function escapeFieldName(fieldName: string): string {
  return (fieldName || '').replace(/(?<!\\)[\^~><:!,|()[\]* ]/g, (char: string) => `\\${char}`);
}
