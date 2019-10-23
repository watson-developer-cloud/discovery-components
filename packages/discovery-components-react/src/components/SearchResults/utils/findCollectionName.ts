import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import get from 'lodash/get';

export const findCollectionName = (
  collectionResponse: DiscoveryV1.ListCollectionsResponse | null,
  collectionId: string
): string => {
  const collections = get(collectionResponse, 'collections', []);
  const matchingCollection = collections.find((collection: DiscoveryV1.Collection) => {
    return collection.collection_id === collectionId;
  });
  return get(matchingCollection, 'name', collectionId);
};
