import { FC, SyntheticEvent } from 'react';
import { InternalQueryTermAggregation, FieldFacetsByCategory, SelectedFacet } from 'components/SearchFacets/utils/searchFacetInterfaces';
import { Messages } from 'components/SearchFacets/messages';
interface CategoryFacetsGroupProps {
    /**
     * Facets with categories ordered by category
     */
    facetsByCategory: FieldFacetsByCategory;
    /**
     * Label for the facet
     */
    facetsLabel: string;
    /**
     * Facet text field
     */
    facetsTextField: 'key' | 'text';
    /**
     * Aggregation component settings
     */
    aggregationSettings: InternalQueryTermAggregation;
    /**
     * Callback to handle changes in selected facets
     */
    onCategoryFacetsGroupChange: (selectedFacets: SelectedFacet[]) => void;
    /**
     * i18n messages for the component
     */
    messages: Messages;
    /**
     * How many facets should be shown
     */
    collapsedFacetsCount: number;
    /**
     * If should be displayed as multiselect or single-select
     */
    shouldDisplayAsMultiSelect: boolean;
    /**
     * Text of selected facet
     */
    selectedFacet: string;
    /**
     * Show matching documents count as part of label
     */
    showMatchingResults: boolean;
    /**
     * custom handler invoked when any input element changes in the SearchFacets component
     */
    onChange?: (e: SyntheticEvent<HTMLInputElement>) => void;
}
export declare const CategoryFacetsGroup: FC<CategoryFacetsGroupProps>;
export {};
