import { Filter, FilterChangeArgs } from '../components/FilterPanel/types';
/**
 * Checks if the given filter is empty
 *
 * @param {Object} filter the filter to check for emptiness
 * @returns true if the filter is empty
 */
export declare function isFilterEmpty(filter: Filter): boolean;
/**
 * Checks if the given filter contains the given filter part
 *
 * @param {Object} filter the filter
 * @param {string} groupId
 * @param {string} optionId
 * @returns true if the filter is empty
 */
export declare function filterContains(filter: Filter, groupId: string, optionId: string): boolean;
export declare function updateFilter(filter: Filter, { type, checked, groupId, optionId }: FilterChangeArgs): Filter;
