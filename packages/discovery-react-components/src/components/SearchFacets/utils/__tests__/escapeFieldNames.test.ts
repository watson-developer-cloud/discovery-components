import { escapeFieldName } from '../escapeFieldName';

describe('escapeFieldName', () => {
  test('correctly escapes special characters in a field name', () => {
    const escapedFieldName = escapeFieldName('s:o~m<e|t^h*i[n(g)]>');
    expect(escapedFieldName).toEqual('s\\:o\\~m\\<e\\|t\\^h\\*i\\[n\\(g\\)\\]\\>');
  });
});
