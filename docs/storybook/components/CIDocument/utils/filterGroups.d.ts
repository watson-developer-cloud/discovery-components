import { FilterGroup } from '../components/FilterPanel/types';
export interface FilterGroupWithFns extends Omit<FilterGroup, 'title'> {
    labelsFromItem: (item: any) => string[];
    applyFilter: (list: any[], label: string) => any[];
}
/**
 * Get the filter groups for the given model type
 *
 * @param {string} enrichmentName id of current model
 * @param {function} formatMessage intl formatMessage function
 * @param {string} selectedType selected type. (used for sharedDomains)
 * @returns a list of filter groups
 */
declare function getBaseFilterGroups(enrichmentName: string, messages: Record<string, string>): FilterGroup[];
export { getBaseFilterGroups };
