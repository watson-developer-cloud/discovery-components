import { escapeFieldName } from '../escapeFieldName';

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
