import { FC, SyntheticEvent } from 'react';
import { Messages } from 'components/SearchFacets/messages';
import { SelectableDynamicFacets, SelectableQueryTermAggregationResult, InternalQueryTermAggregation, SelectedFacet } from 'components/SearchFacets/utils/searchFacetInterfaces';
interface SingleSelectFacetsGroupProps {
    /**
     * override default messages for the component by specifying custom and/or internationalized text strings
     */
    messages: Messages;
    /**
     * Facets text and selected flag
     */
    facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[];
    /**
     * Aggregation component settings
     */
    aggregationSettings: InternalQueryTermAggregation;
    /**
     * Facet text field
     */
    facetsTextField: 'key' | 'text';
    /**
     * Show matching documents count as part of label
     */
    showMatchingResults: boolean;
    /**
     * Text of selected facet
     */
    selectedFacet: string;
    /**
     * Callback to handle changes in selected facets
     */
    onSingleSelectFacetsGroupChange: (selectedFacets: SelectedFacet[]) => void;
    /**
     * Temporary array of selected facets for the ShowMoreModal before it's closed or saved
     */
    tempSelectedFacets?: SelectedFacet[];
    /**
     * Sets the state of the temporary array of selected facets for the ShowMoreModal before it's closed or saved
     */
    setTempSelectedFacets?: (selectedFacets: SelectedFacet[]) => void;
    /**
     * custom handler invoked when any input element changes in the SearchFacets component
     */
    onChange?: (e: SyntheticEvent<HTMLInputElement>) => void;
}
export declare const SingleSelectFacetsGroup: FC<SingleSelectFacetsGroupProps>;
export {};
