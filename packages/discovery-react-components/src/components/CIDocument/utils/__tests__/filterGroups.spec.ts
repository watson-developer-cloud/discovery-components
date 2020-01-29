import { getBaseFilterGroups, FilterGroupWithFns } from '../filterGroups';

const contractMessages = {
  contractCategoryLabel: 'Filter Group A',
  contractNatureLabel: 'Filter Group B',
  contractPartyLabel: 'Filter Group C',
  contractAttributeLabel: 'Filter Group D'
};

describe('filterGroups', () => {
  it('handles invalid ducment types correctly', () => {
    const invalidDocType = getBaseFilterGroups('foobar', contractMessages);
    console.log(invalidDocType);
    expect(invalidDocType).toEqual([]);
  });
});
