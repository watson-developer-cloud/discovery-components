import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import get from 'lodash/get';

export const findCollectionName = (
  collectionResponse: DiscoveryV2.ListCollectionsResponse | null,
  collectionId: string
): string => {
  const collections = get(collectionResponse, 'collections', []);
  const matchingCollection = collections.find((collection: DiscoveryV2.Collection) => {
    return collection.collection_id === collectionId;
  });
  return get(matchingCollection, 'name', collectionId);
};
