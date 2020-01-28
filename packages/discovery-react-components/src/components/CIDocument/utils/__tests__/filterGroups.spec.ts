import { getBaseFilterGroups, FilterGroupWithFns } from '../filterGroups';

describe('filterGroups', () => {
  const contractMessages = {
    FILTER_GROUP_A: 'Filter Group A',
    FILTER_GROUP_B: 'Filter Group B',
    FILTER_GROUP_C: 'Filter Group C'
  };
  const invoiceMessages = {
    relations: 'Filter Group A',
    attributes: 'Filter Group B'
    //attributes: 'Filter Group C'
  };

  it('getBaseFilterGroups', () => {
    console.log(getBaseFilterGroups('foobar', contractMessages));
    console.log(getBaseFilterGroups('contract', contractMessages));
    console.log(getBaseFilterGroups('invoice', invoiceMessages));
  });
});
