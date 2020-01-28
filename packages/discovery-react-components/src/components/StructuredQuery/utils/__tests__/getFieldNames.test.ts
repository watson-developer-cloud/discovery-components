import { getFieldNames } from '../getFieldNames';

function matchingArrays(array1: string[], array2: string[]): boolean {
  return array1.toString() === array2.toString();
}

describe('getFieldNames', () => {
  describe('when given non nested fields', () => {
    it('returns the correct field names', () => {
      const fields = { fields: [{ field: 'fieldname 1' }, { field: 'fieldname 2' }] };
      const fieldNames = getFieldNames(fields);
      expect(matchingArrays(fieldNames, ['fieldname 1', 'fieldname 2'])).toBe(true);
    });
  });

  describe('when given fields that are of type nested', () => {
    it('does not return the nested fields', () => {
      const fields = {
        fields: [
          { field: 'fieldname 1' },
          { field: 'fieldname 2' },
          { field: 'fieldname 3', type: 'nested' }
        ]
      };
      const fieldNames = getFieldNames(fields);
      expect(matchingArrays(fieldNames, ['fieldname 1', 'fieldname 2'])).toBe(true);
    });
  });

  describe('when given an array of fields containing duplicate field names', () => {
    it('returns a deduplicated array of field names', () => {
      const fields = {
        fields: [{ field: 'fieldname 1' }, { field: 'fieldname 2' }, { field: 'fieldname 2' }]
      };
      const fieldNames = getFieldNames(fields);
      expect(matchingArrays(fieldNames, ['fieldname 1', 'fieldname 2'])).toBe(true);
    });
  });
});
