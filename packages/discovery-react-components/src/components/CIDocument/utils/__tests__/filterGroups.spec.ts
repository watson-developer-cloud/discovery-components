import { getBaseFilterGroups } from '../filterGroups';

describe('filterGroups', () => {
  it('handles invalid document types correctly', () => {
    const invalidDocType = getBaseFilterGroups('foobar', { FILTER_GROUP_A: 'Filter Group A' });
    expect(invalidDocType).toEqual([]);
  });
});
