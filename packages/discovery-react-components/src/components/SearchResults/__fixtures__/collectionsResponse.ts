import DiscoveryV2 from 'ibm-watson/discovery/v2';
export const COLLECTION_ID_1 = '8713a92b-28aa-b291-0000-016ddc68aa2a';

const collectionsResponse: DiscoveryV2.ListCollectionsResponse = {
  collections: [
    {
      collection_id: COLLECTION_ID_1,
      name: 'IBM Docs'
    }
  ]
};
export default collectionsResponse;
