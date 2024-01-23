import { FC, SyntheticEvent } from 'react';
import { Messages } from 'components/SearchFacets/messages';
import { InternalQueryTermAggregation, SelectableFieldFacetWithCategory, SelectedFacet } from 'components/SearchFacets/utils/searchFacetInterfaces';
interface CategoryFacetsProps {
    /**
     * Name of the category group within the facet
     */
    categoryName: string;
    /**
     * Label for the facet
     */
    facetsLabel: string;
    /**
     * Facets for the category
     */
    facets: SelectableFieldFacetWithCategory[];
    /**
     * Facet text field
     */
    facetsTextField: 'key' | 'text';
    /**
     * Callback to handle changes in selected facets
     */
    onCategoryFacetsChange: (selectedFacets: SelectedFacet[]) => void;
    /**
     * i18n messages for the component
     */
    messages: Messages;
    /**
     * If category is expanded or collapsed
     */
    categoryIsExpanded: boolean;
    /**
     * How many facets should be shown
     */
    collapsedFacetsCount: number;
    /**
     * Callback to handle changes in expansion/collapse of category group
     */
    onClick: (categoryName: string, facetLabel: string) => void;
    /**
     * Aggregation component settings
     */
    aggregationSettings: InternalQueryTermAggregation;
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
export declare const CategoryFacets: FC<CategoryFacetsProps>;
export {};
