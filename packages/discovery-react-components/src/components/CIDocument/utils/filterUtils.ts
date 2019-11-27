import { Filter, FilterChangeArgs } from '../components/FilterPanel/types';

/**
 * Checks if the given filter is empty
 *
 * @param {Object} filter the filter to check for emptiness
 * @returns true if the filter is empty
 */
export function isFilterEmpty(filter: Filter): boolean {
  return !Object.values(filter).some(labelList => labelList.length !== 0);
}

/**
 * Checks if the given filter contains the given filter part
 *
 * @param {Object} filter the filter
 * @param {string} groupId
 * @param {string} optionId
 * @returns true if the filter is empty
 */
export function filterContains(filter: Filter, groupId: string, optionId: string): boolean {
  return !!filter[groupId] && filter[groupId].includes(optionId);
}

export function updateFilter(
  filter: Filter,
  { type, checked = true, groupId, optionId }: FilterChangeArgs
): Filter {
  const updatedList = [];
  if (type === 'checkbox' && filter[groupId]) {
    updatedList.push(...filter[groupId]);
  }
  if (checked) {
    updatedList.push(optionId);
  } else {
    const index = updatedList.indexOf(optionId);

    if (index > -1) {
      updatedList.splice(index, 1);
    }
  }

  return {
    ...filter,
    [groupId]: updatedList
  };
}
