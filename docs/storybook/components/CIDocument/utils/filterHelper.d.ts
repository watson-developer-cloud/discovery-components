import { FilterGroup } from '../components/FilterPanel/types';
export type HelperFilterFn = (filter: any) => {
    filteredList: any[];
    filterGroups: FilterGroup[];
};
export interface ProcessFilter {
    processFilter: HelperFilterFn;
}
declare function getFilterHelper({ knownFilterGroups, itemList, enrichmentName, messages }: {
    knownFilterGroups?: FilterGroup[];
    itemList: any;
    enrichmentName: string;
    messages: Record<string, string>;
}): {
    processFilter: HelperFilterFn;
};
export { getFilterHelper };
