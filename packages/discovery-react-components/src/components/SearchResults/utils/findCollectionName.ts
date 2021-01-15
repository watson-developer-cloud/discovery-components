import DiscoveryV2 from 'ibm-watson/discovery/v2';
import get from 'lodash/get';

export const findCollectionName = (
  collectionResponse: DiscoveryV2.ListCollectionsResponse | undefined,
  queryResult: DiscoveryV2.QueryResult | DiscoveryV2.QueryTableResult
): string => {
  const collectionId =
    get(queryResult, 'result_metadata.collection_id') || get(queryResult, 'collection_id');
  const collections = get(collectionResponse, 'collections', []);
  const matchingCollection = collections.find((collection: DiscoveryV2.Collection) => {
    return collection.collection_id === collectionId;
  });
  return get(matchingCollection, 'name', collectionId);
};
