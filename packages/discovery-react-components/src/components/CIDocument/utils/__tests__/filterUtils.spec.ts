import { isFilterEmpty, filterContains, updateFilter } from '../filterUtils';
import { Filter } from 'components/CIDocument/components/FilterPanel/types';

const filterPartA1 = {
  optionId: 'Filter A-1',
  groupId: 'FILTER_GROUP_A',
  type: 'checkbox'
};

const filterPartA2 = {
  optionId: 'Filter A-2',
  groupId: 'FILTER_GROUP_A',
  type: 'checkbox'
};

const filterPartB1 = {
  optionId: 'Filter B-1',
  groupId: 'FILTER_GROUP_B',
  type: 'radio'
};

const filterPartB2 = {
  optionId: 'Filter B-2',
  groupId: 'FILTER_GROUP_B',
  type: 'radio'
};

describe('filterUtils', () => {
  describe('isFilterEmpty', () => {
    it('returns true for an empty filter', () => {
      expect(isFilterEmpty({})).toBe(true);
    });

    it('returns false for a non-empty filter', () => {
      const filter = { FILTER_GROUP_A: ['Filter A-2'] };
      expect(isFilterEmpty(filter)).toBe(false);
    });
  });

  describe('filterContains', () => {
    it('returns true when the given filter part is contained in the filter', () => {
      const filter = { FILTER_GROUP_A: ['Filter A-1'] };
      expect(filterContains(filter, filterPartA1.groupId, filterPartA1.optionId)).toBe(true);
    });

    it('returns false if the filte rpart is not found in the filter', () => {
      const filter = { FILTER_GROUP_B: ['Filter B-1', 'Filter B-3'] };
      expect(filterContains(filter, filterPartB2.groupId, filterPartB2.optionId)).toBe(false);
    });
  });

  describe('updateFilter', () => {
    it('updates the given filter with the given change', () => {
      let filter: Filter = {};
      filter = updateFilter(filter, filterPartA1);
      filter = updateFilter(filter, filterPartA2);
      filter = updateFilter(filter, filterPartB1);
      filter = updateFilter(filter, filterPartB2);

      expect(filter.FILTER_GROUP_A.length).toBe(2);
      expect(filter.FILTER_GROUP_B.length).toBe(1);
      expect(filter.FILTER_GROUP_C).toBe(undefined);

      expect(filter.FILTER_GROUP_A[0]).toBe('Filter A-1');
      expect(filter.FILTER_GROUP_A[1]).toBe('Filter A-2');
      expect(filter.FILTER_GROUP_B[0]).toBe('Filter B-2');
    });
  });
});
