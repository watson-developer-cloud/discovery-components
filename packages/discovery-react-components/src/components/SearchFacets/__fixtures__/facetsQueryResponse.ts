import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { createDummyResponse } from 'utils/testingUtils';

export const facetsQueryResponse: DiscoveryV2.Response<
  DiscoveryV2.QueryResponse
> = createDummyResponse({
  matching_results: 123456,
  results: [],
  aggregations: [
    {
      type: 'term',
      name: 'category_id',
      field: 'category',
      count: 3,
      results: [
        {
          key: 'Research',
          matching_results: 138993
        },
        {
          key: 'Analytics',
          matching_results: 57158
        },
        {
          key: 'Documentation',
          matching_results: 32444
        }
      ]
    },
    {
      type: 'term',
      name: 'machine_learning_id',
      field: 'machine_learning_terms',
      count: 5,
      results: [
        {
          key: 'Neural network',
          matching_results: 138993
        },
        {
          key: 'Reinforced learning',
          matching_results: 57158
        },
        {
          key: 'CIFAR-10',
          matching_results: 32444
        },
        {
          key: 'MNIST',
          matching_results: 32444
        },
        {
          key: 'Recommender systems',
          matching_results: 32444
        },
        {
          key: 'Decision trees',
          matching_results: 32444
        }
      ]
    },
    {
      type: 'term',
      name: 'entities',
      field: 'enriched_text.entities.text',
      count: 10,
      results: [
        {
          key: 'ibm',
          matching_results: 138993,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.types',
              count: 1,
              results: [
                {
                  key: 'Organization',
                  matching_results: 4
                }
              ]
            }
          ]
        },
        {
          key: 'us',
          matching_results: 57158,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.types',
              count: 1,
              results: [
                {
                  key: 'Location',
                  matching_results: 4
                }
              ]
            }
          ]
        },
        {
          key: '$299',
          matching_results: 32444,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.types',
              count: 1,
              results: [
                {
                  key: 'Quantity',
                  matching_results: 4
                }
              ]
            }
          ]
        },
        {
          key: 'watson',
          matching_results: 32444,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.types',
              count: 1,
              results: [
                {
                  key: 'Organization',
                  matching_results: 4
                }
              ]
            }
          ]
        },
        {
          key: 'eu',
          matching_results: 57158,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.types',
              count: 1,
              results: [
                {
                  key: 'Location',
                  matching_results: 4
                }
              ]
            }
          ]
        },
        {
          key: 'new york',
          matching_results: 57158,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.types',
              count: 1,
              results: [
                {
                  key: 'Location',
                  matching_results: 4
                }
              ]
            }
          ]
        },
        {
          key: 'pittsburgh',
          matching_results: 57158,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.types',
              count: 1,
              results: [
                {
                  key: 'Location',
                  matching_results: 4
                }
              ]
            }
          ]
        },
        {
          key: 'austin',
          matching_results: 57158,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.types',
              count: 1,
              results: [
                {
                  key: 'Location',
                  matching_results: 4
                }
              ]
            }
          ]
        },
        {
          key: 'boston',
          matching_results: 57158,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.types',
              count: 1,
              results: [
                {
                  key: 'Location',
                  matching_results: 4
                }
              ]
            }
          ]
        },
        {
          key: 'pennsylvania',
          matching_results: 57158,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.types',
              count: 1,
              results: [
                {
                  key: 'Location',
                  matching_results: 4
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  suggested_refinements: [
    {
      text: 'regression'
    },
    {
      text: 'classification'
    },
    {
      text: 'naive bayes'
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
      name: 'author_id',
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
      name: 'subject_id',
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
