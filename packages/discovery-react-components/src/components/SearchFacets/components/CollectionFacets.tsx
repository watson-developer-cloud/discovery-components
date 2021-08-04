import React, { FC, useContext } from 'react';
import get from 'lodash/get';
import { Messages } from '../messages';
import { collectionFacetIdPrefix } from '../cssClasses';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import { MultiSelect as CarbonMultiSelect } from 'carbon-components-react';
import { Collection } from 'ibm-watson/discovery/v2';
import { CollectionItem, SelectedCollectionItems } from '../utils/searchFacetInterfaces';

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

export const CollectionFacets: FC<CollectionFacetsProps> = ({
  initialSelectedCollections,
  messages,
  onChange
}) => {
  const { collectionsResults } = useContext(SearchContext);
  const collections: Collection[] = get(collectionsResults, 'collections', []);

  const collectionItems: CollectionItem[] = collections.map(collection => {
    return {
      id: `${collectionFacetIdPrefix}${collection.collection_id}`,
      label: collection.name || ''
    };
  });

  const handleCollectionToggle = (toggledCollections: SelectedCollectionItems) => {
    onChange(toggledCollections);
  };

  // TODO: figure out why MultiSelect doesn't set initialSelectedItems on subsequent renders
  if (collectionItems.length > 0) {
    return (
      <CarbonMultiSelect
        id={`${collectionFacetIdPrefix}select`}
        items={collectionItems}
        initialSelectedItems={initialSelectedCollections}
        label={messages.collectionSelectLabel}
        onChange={handleCollectionToggle}
        titleText={messages.collectionSelectTitleText}
      />
    );
  }
  return null;
};
