import { FC, SyntheticEvent } from 'react';
import { SelectableDynamicFacets, SearchFilterFacets } from '../utils/searchFacetInterfaces';
import { Messages } from '../messages';
interface DynamicFacetsProps {
    /**
     * Dynamic facets text and selected flag
     */
    dynamicFacets: SelectableDynamicFacets[];
    /**
     * Show matching documents count as part of label
     */
    showMatchingResults: boolean;
    /**
     * i18n messages for the component
     */
    messages: Messages;
    /**
     * Number of facet terms to show when list is collapsed
     */
    collapsedFacetsCount: number;
    /**
     * Callback to handle changes in selected facets
     */
    onDynamicFacetsChange: (updatedFacet: Partial<SearchFilterFacets>) => void;
    /**
     * custom handler invoked when any input element changes in the SearchFacets component
     */
    onChange?: (e: SyntheticEvent<HTMLInputElement>) => void;
}
export declare const DynamicFacets: FC<DynamicFacetsProps>;
export {};
