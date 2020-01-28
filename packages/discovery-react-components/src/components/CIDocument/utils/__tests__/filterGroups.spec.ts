import { getBaseFilterGroups, FilterGroupWithFns } from '../filterGroups';

const contractMessages = {
  contractCategoryLabel: 'Filter Group A',
  contractNatureLabel: 'Filter Group B',
  contractPartyLabel: 'Filter Group C',
  contractAttributeLabel: 'Filter Group D'
};

const invoiceMessages = {
  invoiceAttributeLabel: 'Filter Group E',
  invoiceRelationsLabel: 'Filter Group F'
};

describe('filterGroups', () => {
  it('getBaseFilterGroups', () => {
    console.log(getBaseFilterGroups('foobar', contractMessages));
    console.log(getBaseFilterGroups('contract', contractMessages));
    console.log(getBaseFilterGroups('invoice', invoiceMessages));
  });
});
