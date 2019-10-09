import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import { QueryTermAggregation } from '../utils/searchRefinementInterfaces';

interface QueryResponseWithTermAggregation extends DiscoveryV1.QueryResponse {
  aggregations?: Array<QueryTermAggregation>;
}

const refinementsQueryResponse: QueryResponseWithTermAggregation = {
  matching_results: 123456,
  results: [],
  aggregations: [
    {
      type: 'term',
      field: 'author',
      count: 3,
      results: [
        {
          key: 'ABMN Staff',
          matching_results: 138993
        },
        {
          key: 'News Staff',
          matching_results: 57158
        },
        {
          key: 'editor',
          matching_results: 32444
        }
      ]
    },
    {
      type: 'term',
      field: 'subject',
      count: 4,
      results: [
        {
          key: 'Animals',
          matching_results: 138993
        },
        {
          key: 'People',
          matching_results: 133760
        },
        {
          key: 'Places',
          matching_results: 129139
        },
        {
          key: 'Things',
          matching_results: 76403
        }
      ]
    }
  ]
};

export default refinementsQueryResponse;
