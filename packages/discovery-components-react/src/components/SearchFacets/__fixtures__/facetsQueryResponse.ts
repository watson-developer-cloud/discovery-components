import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import { createDummyResponse } from '../../../utils/testingUtils';

export const facetsQueryResponse: DiscoveryV2.Response<
  DiscoveryV2.QueryResponse
> = createDummyResponse({
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
      count: 6,
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
          key: 'Mumford & Sons',
          matching_results: 96403
        },
        {
          key: 'Gritty',
          matching_results: 95303
        },
        {
          key: 'Things',
          matching_results: 76403
        }
      ]
    }
  ],
  suggested_refinements: [
    {
      text: 'sharks are dangerous'
    },
    {
      text: 'sloths are slow'
    },
    {
      text: 'people are messy'
    }
  ]
});

export const weirdFacetsQueryResponse: DiscoveryV2.Response<
  DiscoveryV2.QueryResponse
> = createDummyResponse({
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
      count: 7,
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
        },
        {
          key: 'This | that',
          matching_results: 2727
        },
        {
          key: 'something: else',
          matching_results: 18111
        },
        {
          key: 'hey, you',
          matching_results: 8282
        }
      ]
    }
  ],
  suggested_refinements: [
    {
      text: 'trust the process'
    },
    {
      text: 'just not the electrician'
    },
    {
      text: 'sam hinkie'
    },
    {
      text: 'this: is'
    },
    {
      text: 'bogus, strings'
    },
    {
      text: 'maybe | not'
    }
  ]
});

export default facetsQueryResponse;
