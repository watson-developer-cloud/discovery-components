import { FC } from 'react';
import { Messages } from 'components/SearchFacets/messages';
import { SelectableDynamicFacets, SelectableQueryTermAggregationResult } from 'components/SearchFacets/utils/searchFacetInterfaces';
interface ModalSearchInputProps {
    /**
     * Facets configuration with fields and results counts
     */
    facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[];
    /**
     * Sets the list of filtered facets
     */
    setFilteredFacets: (value: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[]) => void;
    /**
     * Specifies whether the modal is open
     */
    isModalOpen: boolean;
    /**
     * Facet label text
     */
    facetsLabel: string;
    /**
     * Facet text field
     */
    facetsTextField: 'key' | 'text';
    /**
     * i18n messages for the component
     */
    messages: Messages;
}
export declare const ModalSearchInput: FC<ModalSearchInputProps>;
export {};
