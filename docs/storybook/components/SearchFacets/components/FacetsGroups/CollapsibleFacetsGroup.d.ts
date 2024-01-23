import { FC, SyntheticEvent } from 'react';
import { SelectableDynamicFacets, SelectableQueryTermAggregationResult, InternalQueryTermAggregation, SelectedFacet } from 'components/SearchFacets/utils/searchFacetInterfaces';
import { Messages } from 'components/SearchFacets/messages';
interface CollapsibleFacetsGroupProps {
    /**
     * Facets configuration with fields and results counts
     */
    facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[];
    /**
     * Show matching documents count as part of label
     */
    showMatchingResults: boolean;
    /**
     * Aggregation component settings
     */
    aggregationSettings: InternalQueryTermAggregation;
    /**
     * How many facets should be shown
     */
    collapsedFacetsCount: number;
    /**
     * i18n messages for the component
     */
    messages: Messages;
    /**
     * Facet text field
     */
    facetsTextField: 'key' | 'text';
    /**
     * Callback to handle changes in selected facets
     */
    onCollapsibleFacetsGroupChange: (selectedFacets: SelectedFacet[]) => void;
    /**
     * Callback to reset selected facet
     */
    onClear: (selectedFacetName?: string) => void;
    /**
     * Whether this is an enriched entities facet that includes categories by which to organize facet values
     */
    hasCategories: boolean;
    /**
     * custom handler invoked when any input element changes in the SearchFacets component
     */
    onChange?: (e: SyntheticEvent<HTMLInputElement>) => void;
}
export declare const CollapsibleFacetsGroup: FC<CollapsibleFacetsGroupProps>;
export {};
