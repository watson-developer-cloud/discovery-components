import { getFilterHelper, ProcessFilter } from '../filterHelper';
import mockFilterGroups from '../__fixtures__/filterGroups';
import mockFilterElements from '../__fixtures__/filterMockElements.json';
import { FilterGroup } from 'components/CIDocument/components/FilterPanel/types';

describe('filterHelper', () => {
  let filterHelper: ProcessFilter;

  beforeEach(() => {
    filterHelper = getFilterHelper({
      knownFilterGroups: mockFilterGroups as unknown as FilterGroup[],
      itemList: mockFilterElements,
      enrichmentName: 'foobar',
      messages: {
        FILTER_GROUP_A: 'Filter Group A',
        FILTER_GROUP_B: 'Filter Group B',
        FILTER_GROUP_C: 'Filter Group C'
      }
    });
  });

  describe('processFilter', () => {
    it('returns the default list and filter groups if the filter is empty', () => {
      const { filteredList, filterGroups } = filterHelper.processFilter({});

      expect(filteredList.length).toBe(mockFilterElements.length);
      expect(filteredList.every(element => mockFilterElements.includes(element))).toBe(true);

      expect(Object.keys(filterGroups).length).toBe(Object.keys(mockFilterGroups).length);
      expect(
        Object.keys(filterGroups).every(element => Object.keys(mockFilterGroups).includes(element))
      ).toBe(true);
    });

    it('returns a filtered list and filter groups based on the given filter (1)', () => {
      const { filteredList, filterGroups } = filterHelper.processFilter({
        FILTER_GROUP_A: ['Filter A-3'],
        FILTER_GROUP_B: ['Filter B-3'],
        FILTER_GROUP_C: ['Filter C-1']
      });

      expect(filterGroups[0].optionsList).toBeTruthy();
      expect(filterGroups[1].optionsList).toBeTruthy();
      expect(filterGroups[2].optionsList).toBeTruthy();

      if (
        filterGroups[0].optionsList &&
        filterGroups[1].optionsList &&
        filterGroups[2].optionsList
      ) {
        expect(filterGroups[0].optionsList[0].count).toBe(1);
        expect(filterGroups[0].optionsList[1].count).toBe(1);
        expect(filterGroups[0].optionsList[2].count).toBe(3);
        expect(filterGroups[1].optionsList[0].count).toBe(0);
        expect(filterGroups[1].optionsList[1].count).toBe(1);
        expect(filterGroups[1].optionsList[2].count).toBe(3);
        expect(filterGroups[1].optionsList[3].count).toBe(1);
        expect(filterGroups[1].optionsList[4].count).toBe(0);
        expect(filterGroups[2].optionsList[0].count).toBe(3);
        expect(filterGroups[2].optionsList[1].count).toBe(1);
      }

      expect(filteredList.length).toBe(3);
    });

    it('returns a filtered list and filter groups based on the given filter (2)', () => {
      const { filteredList, filterGroups } = filterHelper.processFilter({
        FILTER_GROUP_A: ['Filter A-1'],
        FILTER_GROUP_B: ['Filter B-1'],
        FILTER_GROUP_C: ['Filter C-1']
      });

      expect(filterGroups[0].optionsList).toBeTruthy();
      expect(filterGroups[1].optionsList).toBeTruthy();
      expect(filterGroups[2].optionsList).toBeTruthy();

      if (
        filterGroups[0].optionsList &&
        filterGroups[1].optionsList &&
        filterGroups[2].optionsList
      ) {
        expect(filterGroups[0].optionsList[0].count).toBe(1);
        expect(filterGroups[0].optionsList[1].count).toBe(0);
        expect(filterGroups[0].optionsList[2].count).toBe(0);
        expect(filterGroups[1].optionsList[0].count).toBe(1);
        expect(filterGroups[1].optionsList[1].count).toBe(1);
        expect(filterGroups[1].optionsList[2].count).toBe(1);
        expect(filterGroups[1].optionsList[3].count).toBe(0);
        expect(filterGroups[1].optionsList[4].count).toBe(1);
        expect(filterGroups[2].optionsList[0].count).toBe(1);
        expect(filterGroups[2].optionsList[1].count).toBe(0);
      }

      expect(filteredList.length).toBe(1);
    });

    it('returns a filtered list and filter groups based on the given filter (3)', () => {
      const { filteredList, filterGroups } = filterHelper.processFilter({
        FILTER_GROUP_A: ['Filter A-1'],
        FILTER_GROUP_B: ['Filter B-3'],
        FILTER_GROUP_C: ['Filter C-2']
      });

      expect(filterGroups[0].optionsList).toBeTruthy();
      expect(filterGroups[1].optionsList).toBeTruthy();
      expect(filterGroups[2].optionsList).toBeTruthy();

      if (
        filterGroups[0].optionsList &&
        filterGroups[1].optionsList &&
        filterGroups[2].optionsList
      ) {
        expect(filterGroups[0].optionsList[0].count).toBe(0);
        expect(filterGroups[0].optionsList[1].count).toBe(0);
        expect(filterGroups[0].optionsList[2].count).toBe(0);
        expect(filterGroups[1].optionsList[0].count).toBe(0);
        expect(filterGroups[1].optionsList[1].count).toBe(0);
        expect(filterGroups[1].optionsList[2].count).toBe(0);
        expect(filterGroups[1].optionsList[3].count).toBe(0);
        expect(filterGroups[1].optionsList[4].count).toBe(0);
        expect(filterGroups[2].optionsList[0].count).toBe(1);
        expect(filterGroups[2].optionsList[1].count).toBe(0);
      }

      expect(filteredList.length).toBe(0);
    });

    it('returns a filtered list and filter groups based on the given filter (4)', () => {
      const { filteredList, filterGroups } = filterHelper.processFilter({
        FILTER_GROUP_A: ['Filter A-1']
      });

      expect(filterGroups[0].optionsList).toBeTruthy();
      expect(filterGroups[1].optionsList).toBeTruthy();
      expect(filterGroups[2].optionsList).toBeTruthy();

      if (
        filterGroups[0].optionsList &&
        filterGroups[1].optionsList &&
        filterGroups[2].optionsList
      ) {
        expect(filterGroups[0].optionsList[0].count).toBe(3);
        expect(filterGroups[0].optionsList[1].count).toBe(1);
        expect(filterGroups[0].optionsList[2].count).toBe(1);
        expect(filterGroups[1].optionsList[0].count).toBe(1);
        expect(filterGroups[1].optionsList[1].count).toBe(1);
        expect(filterGroups[1].optionsList[2].count).toBe(1);
        expect(filterGroups[1].optionsList[3].count).toBe(0);
        expect(filterGroups[1].optionsList[4].count).toBe(1);
        expect(filterGroups[2].optionsList[0].count).toBe(3);
        expect(filterGroups[2].optionsList[1].count).toBe(0);
      }

      expect(filteredList.length).toBe(3);
    });

    it('returns a filtered list and filter groups based on the given filter (5)', () => {
      const { filteredList, filterGroups } = filterHelper.processFilter({
        FILTER_GROUP_C: ['Filter C-1']
      });

      expect(filterGroups[0].optionsList).toBeTruthy();
      expect(filterGroups[1].optionsList).toBeTruthy();
      expect(filterGroups[2].optionsList).toBeTruthy();

      if (
        filterGroups[0].optionsList &&
        filterGroups[1].optionsList &&
        filterGroups[2].optionsList
      ) {
        expect(filterGroups[0].optionsList[0].count).toBe(3);
        expect(filterGroups[0].optionsList[1].count).toBe(3);
        expect(filterGroups[0].optionsList[2].count).toBe(3);
        expect(filterGroups[1].optionsList[0].count).toBe(1);
        expect(filterGroups[1].optionsList[1].count).toBe(2);
        expect(filterGroups[1].optionsList[2].count).toBe(3);
        expect(filterGroups[1].optionsList[3].count).toBe(1);
        expect(filterGroups[1].optionsList[4].count).toBe(1);
        expect(filterGroups[2].optionsList[0].count).toBe(6);
        expect(filterGroups[2].optionsList[1].count).toBe(4);
      }

      expect(filteredList.length).toBe(6);
    });
  });
});
