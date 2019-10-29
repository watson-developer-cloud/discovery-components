import React, { FC, useContext } from 'react';
import get from 'lodash/get';
import { SearchContext, SearchApi } from '../../DiscoverySearch/DiscoverySearch';
import { MultiSelect as CarbonMultiSelect } from 'carbon-components-react';
import { settings } from 'carbon-components';
import { Collection } from '@disco-widgets/ibm-watson/discovery/v1';

interface SelectedCollectionItems {
  selectedItems: CollectionItem[];
}

interface CollectionItem {
  id: string;
  label: string;
}

interface CollectionRefinementsProps {
  label: string;
  titleText: string;
}

export const CollectionRefinements: FC<CollectionRefinementsProps> = ({ label, titleText }) => {
  const idPrefix = 'collection-refinement-';
  const {
    collectionsResults,
    searchParameters,
    searchParameters: { collectionIds }
  } = useContext(SearchContext);
  const { performSearch } = useContext(SearchApi);
  const collections: Collection[] = get(collectionsResults, 'collections', []);
  const selectedCollectionIds = collectionIds || [];
  const selectedCollections = collections
    .filter(collection => {
      return !!collection.collection_id && selectedCollectionIds.includes(collection.collection_id);
    })
    .map(collection => {
      return {
        id: `${idPrefix}${collection.collection_id}`,
        label: collection.name || ''
      };
    });

  const collectionItems: CollectionItem[] = collections.map(collection => {
    return {
      id: `${idPrefix}${collection.collection_id}`,
      label: collection.name || ''
    };
  });

  const handleCollectionToggle = (toggledCollections: SelectedCollectionItems) => {
    // Filtering by id !== undefined still threw TS errors, so had to default
    // to '' and filter on that
    const collectionIds = toggledCollections.selectedItems
      .map(collection => {
        return collection.id.split(idPrefix).pop() || '';
      })
      .filter(id => id !== '');
    performSearch({ ...searchParameters, offset: 0, collectionIds });
  };

  // TODO: figure out why MultiSelect doesn't set initialSelectedItems on subsequent renders
  if (collectionItems.length > 0) {
    return (
      <fieldset className={`${settings.prefix}--fieldset`}>
        <CarbonMultiSelect
          id={`${idPrefix}select`}
          items={collectionItems}
          initialSelectedItems={selectedCollections}
          label={label}
          titleText={titleText}
          onChange={handleCollectionToggle}
        />
      </fieldset>
    );
  }
  return null;
};
