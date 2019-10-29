import { Response, ListCollectionsResponse } from '@disco-widgets/ibm-watson/discovery/v2';
import { createDummyResponse } from '../../../utils/testingUtils';

const collectionsResponse: Response<ListCollectionsResponse> = createDummyResponse({
  collections: [
    {
      name: 'deadspin',
      collection_id: 'deadspin9876'
    },
    {
      name: 'espn',
      collection_id: 'espn1234'
    }
  ]
});

export default collectionsResponse;
