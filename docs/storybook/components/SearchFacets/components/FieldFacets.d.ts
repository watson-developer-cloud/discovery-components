import { FC, SyntheticEvent } from 'react';
import { InternalQueryTermAggregation, SearchFilterFacets } from '../utils/searchFacetInterfaces';
import { Messages } from '../messages';
interface FieldFacetsProps {
    /**
     * Facets configuration with fields and results counts
     */
    allFacets: InternalQueryTermAggregation[];
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
    onFieldFacetsChange: (updatedFacet: Partial<SearchFilterFacets>) => void;
    /**
     * custom handler invoked when any input element changes in the SearchFacets component
     */
    onChange?: (e: SyntheticEvent<HTMLInputElement>) => void;
}
export declare const FieldFacets: FC<FieldFacetsProps>;
export {};
