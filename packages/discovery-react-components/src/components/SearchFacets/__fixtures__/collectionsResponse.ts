import { Response, ListCollectionsResponse } from 'ibm-watson/discovery/v2';
import { createDummyResponse } from 'utils/testingUtils';

const collectionsResponse: Response<ListCollectionsResponse> = createDummyResponse({
  collections: [
    {
      name: 'Machine Learning',
      collection_id: 'machine-learning'
    },
    {
      name: 'AI Strategy',
      collection_id: 'ai-strategy'
    }
  ]
});

export default collectionsResponse;
