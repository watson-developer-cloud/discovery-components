import uniq from 'lodash/uniq';
import { isFilterEmpty } from './filterUtils';
import { getBaseFilterGroups, FilterGroupWithFns } from './filterGroups';
import { FilterGroup } from '../components/FilterPanel/types';

export type HelperFilterFn = (filter: any) => { filteredList: any[]; filterGroups: FilterGroup[] };

export interface ProcessFilter {
  processFilter: HelperFilterFn;
}

function getFilterHelper({
  knownFilterGroups,
  itemList,
  enrichmentName,
  messages
}: {
  knownFilterGroups?: FilterGroup[];
  itemList: any;
  enrichmentName: string;
  messages: Record<string, string>;
}): { processFilter: HelperFilterFn } {
  const filterGroups = knownFilterGroups
    ? _processFilter(itemList, knownFilterGroups)(itemList).filterGroups
    : _processFilter(itemList, getBaseFilterGroups(enrichmentName, messages))(itemList)
        .filterGroups;

  return {
    processFilter: _processFilter(itemList, filterGroups)
  };
}

function _processFilter(list: any, filterGroups: FilterGroup[]): HelperFilterFn {
  /**
   * Fully applies a filter, generating a filtered list
   * and a list of filter groups with up-to-date counts
   *
   * @param {Object} filter Filter to apply to list
   * @returns a filtered item list and a list of filter groups
   */
  const filterFn: HelperFilterFn = filter => {
    // If the filter is empty, return the unfiltered item list and base filter groups list
    // This isn't absolutely necessary in terms of logic, just a short-circuit for performance
    if (isFilterEmpty(filter)) {
      return {
        filteredList: list,
        filterGroups: filterGroups
      };
    }

    let filteredList = list;
    const updatedFilterGroups = [];

    // Split filters into radio and checkbox type filters
    const radioFilters = {};
    const checkboxFilters = {};
    filterGroups.forEach(group => {
      const filterPart = filter[group.id];
      if (filterPart) {
        if (group.type === 'radio') {
          radioFilters[group.id] = filterPart;
        } else if (group.type === 'checkbox') {
          checkboxFilters[group.id] = filterPart;
        }
      }
    });

    // Filter items based on checkbox type filters
    filteredList = _applyFilter(filteredList, checkboxFilters, filterGroups);

    // Generate counts for radio type filter groups
    filterGroups
      .filter(group => group.type === 'radio')
      .forEach(group => {
        updatedFilterGroups.push(
          _addOptionsToFilterGroup(
            group,
            _applyFilter(
              filteredList,
              {
                ...radioFilters,
                [group.id]: []
              },
              filterGroups
            )
          )
        );
      });

    // Filter items based on radio type filters
    filteredList = _applyFilter(filteredList, radioFilters, filterGroups);

    // Generate counts for checkbox type filter groups
    updatedFilterGroups.push(
      ..._addOptionsToFilterGroups(
        filterGroups.filter(group => group.type === 'checkbox'),
        filteredList
      )
    );

    // Sort new filter groups to the same order as they were before
    updatedFilterGroups.sort((a, b) => {
      return (
        filterGroups.findIndex(group => group.id === a.id) -
        filterGroups.findIndex(group => group.id === b.id)
      );
    });

    return { filteredList, filterGroups: updatedFilterGroups };
  };
  return filterFn;
}

/**
 * Parses out filter group options from a document, including element counts per label
 *
 * @param {Array<Object>} filterGroups List of filter groups
 * @param {Object} itemList List of elements within a document
 * @returns a list of filter groups with their options
 */
function _addOptionsToFilterGroups(filterGroups: FilterGroup[], itemList: any[]): FilterGroup[] {
  return filterGroups.map(group => _addOptionsToFilterGroup(group, itemList));
}

/**
 * Parses out filter group options from a document, including element counts per label
 *
 * @param {Object} group A filter group
 * @param {Object} itemList List of elements within a document
 * @returns a filter group with its options
 */
function _addOptionsToFilterGroup(group: FilterGroup, itemList?: any[]): FilterGroup {
  if (!itemList) {
    return group;
  }

  const labels: any[] = [];

  if (group.optionsList) {
    group.optionsList.forEach(option => labels.push({ ...option, count: 0 }));
  }

  itemList.forEach(item => {
    uniq((group as unknown as FilterGroupWithFns).labelsFromItem(item)).forEach(label => {
      const foundLabel = labels.find(labelObj => labelObj.id === label);
      if (foundLabel) {
        foundLabel.count++;
      } else {
        labels.push({ id: label, displayName: label, count: 1 });
      }
    });
  });

  return {
    ...group,
    optionsList: labels.sort((a, b) => {
      if (a.id > b.id) {
        return 1;
      } else {
        return -1;
      }
    })
  };
}

/**
 * Filters a list based on filter criteria
 *
 * @param {Object} list List of elements within a document
 * @param {Array<Object>} filterGroups List of filter groups
 * @param {Object} filter Filter to apply to list
 * @returns a filtered list
 */
function _applyFilter(list: any[], filter: any, filterGroups: FilterGroup[]): any[] {
  let filteredList = list;

  Object.entries(filter).forEach(([groupId, activeLabels]) => {
    const foundGroup = filterGroups.find(group => group.id === groupId);

    if (foundGroup) {
      (activeLabels as any[]).forEach(activeLabel => {
        filteredList = (foundGroup as unknown as FilterGroupWithFns).applyFilter(
          filteredList,
          activeLabel
        );
      });
    }
  });

  return filteredList;
}

export { getFilterHelper };
