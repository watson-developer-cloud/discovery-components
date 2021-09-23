import { escapeFieldName, unescapeFieldName } from '../escapeFieldName';

describe('escapeFieldName', () => {
  test('correctly escapes special characters', () => {
    const escapedFieldName = escapeFieldName('s:o~m<e|t^h*i[n(g)]>');
    expect(escapedFieldName).toEqual('s\\:o\\~m\\<e\\|t\\^h\\*i\\[n\\(g\\)\\]\\>');
  });

  test('does not escape already escaped characters', () => {
    let escapedFieldName = escapeFieldName('t\\(ext)');
    expect(escapedFieldName).toEqual('t\\(ext\\)');

    escapedFieldName = escapeFieldName('\\(text)');
    expect(escapedFieldName).toEqual('\\(text\\)');
  });
});

describe('unescapeFieldName', () => {
  test('correctly unescapes special characters in an already escaped string', () => {
    const unescapedFieldName = unescapeFieldName('t\\(ext\\)');
    expect(unescapedFieldName).toEqual('t(ext)');
  });

  test('does not affect string without special characters', () => {
    const unescapedFieldName = unescapeFieldName('here\\is_something.com');
    expect(unescapedFieldName).toEqual('here\\is_something.com');
  });
});
