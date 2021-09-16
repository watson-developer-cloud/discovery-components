const SPECIAL_CHARS = '[\\^~><:!,|()[\\]* ]';
const RE_SPECIAL_CHARS_LOOKBEHIND = new RegExp(`(\\\\)?(${SPECIAL_CHARS})`, 'g'); // /(\\)?([\^~><:!,|()[\]* ])/g
const RE_SPECIAL_CHARS_ESCAPED = new RegExp(`(\\\\${SPECIAL_CHARS})`, 'g');

/**
 * Before field names can be used as part of an aggregation query, the following
 * characters within the name must be escaped: ^ ~ > < : ! , | ( ) [ ] *
 * Note: this method does not escape already escaped chars.
 *
 * @param fieldName
 * @returns escaped field name string
 */
export function escapeFieldName(fieldName: string): string {
  // Originally used the following code, with regex lookbehind. However, that's
  // not supported by Safari (yet?).
  // @see https://caniuse.com/js-regexp-lookbehind
  // return (fieldName || '').replace(/(?<!\\)[\^~><:!,|()[\]* ]/g, (char: string) => `\\${char}`);
  return (fieldName || '').replace(
    RE_SPECIAL_CHARS_LOOKBEHIND,
    // don't escape if character (`p2`) was already escaped (`p1`)
    (str: string, p1: string, p2: string) => (p1 ? str : `\\${p2}`)
  );
}

/**
 * Unescaped any string returned from `escapeFieldName`
 * @param fieldName
 * @returns unescaped field name string
 */
export function unescapeFieldName(fieldName: string): string {
  return (fieldName || '').replace(RE_SPECIAL_CHARS_ESCAPED, (str: string) => str.substr(1, 1));
}
