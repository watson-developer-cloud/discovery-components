import * as React from 'react';
import get from 'lodash.get';
import { SearchContext } from '../../DiscoverySearch/DiscoverySearch';
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

export const CollectionRefinements: React.FunctionComponent = () => {
  const idPrefix = 'collection-refinement-';
  const searchContext = React.useContext(SearchContext);
  const {
    onUpdateSelectedCollections,
    onSearch,
    collectionsResults,
    searchParameters: { collection_ids: collectionIds }
  } = searchContext;
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
    onUpdateSelectedCollections(collectionIds);
    onSearch();
  };

  return (
    <fieldset className={`${settings.prefix}--fieldset`}>
      <CarbonMultiSelect
        id={`${idPrefix}select`}
        items={collectionItems}
        initialSelectedItems={selectedCollections}
        label="Available collections"
        titleText="Collections"
        onChange={handleCollectionToggle}
      />
    </fieldset>
  );
};
