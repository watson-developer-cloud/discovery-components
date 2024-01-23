import { FC } from 'react';
import { Messages } from '../messages';
import { SelectedCollectionItems } from '../utils/searchFacetInterfaces';
interface CollectionFacetsProps {
    /**
     * Initially selected collection items
     */
    initialSelectedCollections: SelectedCollectionItems['selectedItems'];
    /**
     * Override default messages for the component by specifying custom and/or internationalized text strings
     */
    messages: Messages;
    /**
     * Callback to handle changes in selected collections
     */
    onChange: (selectedCollectionItems: SelectedCollectionItems) => void;
}
export declare const CollectionFacets: FC<CollectionFacetsProps>;
export {};
