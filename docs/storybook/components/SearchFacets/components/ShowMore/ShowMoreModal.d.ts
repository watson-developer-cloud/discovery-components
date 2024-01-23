import { FC, SyntheticEvent } from 'react';
import { Messages } from 'components/SearchFacets/messages';
import { InternalQueryTermAggregation, SelectableDynamicFacets, SelectableQueryTermAggregationResult, SelectedFacet } from 'components/SearchFacets/utils/searchFacetInterfaces';
interface ShowMoreModalProps {
    /**
     * i18n messages for the component
     */
    messages: Messages;
    /**
     * Aggregation component settings
     */
    aggregationSettings: InternalQueryTermAggregation;
    /**
     * Facets configuration with fields and results counts
     */
    facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[];
    /**
     * Facet label text
     */
    facetsLabel: string;
    /**
     * Facet text field
     */
    facetsTextField: 'key' | 'text';
    /**
     * Callback to handle changes in selected facets
     */
    onShowMoreModalChange: (selectedFacets: SelectedFacet[]) => void;
    /**
     * Specifies whether the modal is open
     */
    isOpen: boolean;
    /**
     * Used to set the modal to closed state when modal is saved or otherwise closed
     */
    setIsModalOpen: (value: boolean) => void;
    /**
     * Whether the facet should be displayed as multiselect or single-select
     */
    shouldDisplayAsMultiSelect: boolean;
    /**
     * Selected facet for single-select
     */
    selectedFacet: string;
    /**
     * Show matching documents count as part of label
     */
    showMatchingResults: boolean;
    /**
     * If more than 15 facets, adds a search bar
     */
    hasSearchBar: boolean;
    /**
     * Category name if the modal is for a category facet group
     */
    categoryName?: string;
    /**
     * custom handler invoked when any input element changes in the SearchFacets component
     */
    onChange?: (e: SyntheticEvent<HTMLInputElement>) => void;
}
export declare const ShowMoreModal: FC<ShowMoreModalProps>;
export {};
