// These characters within a field name must be escaped when generating queries: ^ ~ > < : ! , | ( ) [ ] *
const SPECIAL_CHARS = '[\\^~><:!,|()[\\]* ]';
// When escaping, look for any special characters (that haven't already been escaped).
const RE_SPECIAL_CHARS_LOOKBEHIND = new RegExp(`(\\\\)?(${SPECIAL_CHARS})`, 'g'); // /(\\)?([\^~><:!,|()[\]* ])/g
// When unescaping, look for any of the special characters that have been escaped
const RE_SPECIAL_CHARS_ESCAPED = new RegExp(`(\\\\${SPECIAL_CHARS})`, 'g');

/**
 * Escape "special" characters in field names.
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
