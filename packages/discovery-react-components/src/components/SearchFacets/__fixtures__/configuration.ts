import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { QueryAggregationWithName } from '../utils/searchFacetInterfaces';

export const configurationWithOneField: DiscoveryV2.QueryTermAggregation[] = [
  {
    type: 'term',
    field: 'enriched_text.keywords',
    count: 10
  }
];

export const configurationWithTwoFields: DiscoveryV2.QueryTermAggregation[] = [
  {
    type: 'term',
    field: 'enriched_text.keywords',
    count: 10
  },
  {
    type: 'term',
    field: 'author',
    count: 5
  }
];

export const configurationWithTwoFielsdWithSpecialChars: DiscoveryV2.QueryTermAggregation[] = [
  {
    type: 'term',
    field: 's:o~m<e|t^h*i[n(g)]>',
    count: 10
  },
  {
    type: 'term',
    field: 'enriched_s:o~m<e|t^h*i[n(g)]>.entities.text',
    count: 10
  }
];

export const configurationWithoutCounts: DiscoveryV2.QueryTermAggregation[] = [
  {
    type: 'term',
    field: 'enriched_text.keywords'
  },
  {
    type: 'term',
    field: 'author'
  }
];

export const configurationWithTopEntities: QueryAggregationWithName[] = [
  {
    type: 'term',
    field: 'enriched_text.entities.text',
    count: 12,
    name: 'entities'
  },
  {
    type: 'term',
    field: 'author'
  }
];

export const configurationWithNestedQueryAggregation: QueryAggregationWithName[] = [
  {
    type: 'term',
    field: 'enriched_text.entities.text',
    count: 12,
    name: 'entities'
  },
  {
    type: 'term',
    field: 'author'
  },
  {
    type: 'nested',
    path: 'enriched_text.entities',
    matching_results: 496,
    aggregations: [
      {
        type: 'filter',
        match: 'enriched_text.entities.model_name:"Dictionary:.products"',
        matching_results: 0,
        aggregations: [
          {
            type: 'term',
            field: 'enriched_text.entities.text',
            count: 4,
            name: 'dict_ypKBKYnM8LOq'
          }
        ]
      }
    ]
  }
];

export const configurationWithFilterQueryAggregation: QueryAggregationWithName[] = [
  {
    type: 'term',
    field: 'enriched_text.entities.text',
    count: 12,
    name: 'entities'
  },
  {
    type: 'term',
    field: 'author'
  },
  {
    type: 'filter',
    match: 'enriched_text.entities.enriched_text.entities.model_name:"Dictionary:.test"',
    matching_results: 0,
    aggregations: [
      {
        type: 'term',
        field: 'enriched_text.entities.enriched_text.entities.text',
        count: 4,
        name: 'dict_yqYQPpM8OljE'
      }
    ]
  }
];

export const configurationWithFilterQueryAggregationWithSpecialCharacters: QueryAggregationWithName[] =
  [
    {
      type: 'term',
      field: 'enriched_text.entities.text',
      count: 12,
      name: 'entities'
    },
    {
      type: 'term',
      field: 'author'
    },
    {
      type: 'filter',
      match: 'enriched_t\\(ext\\).entities.model_name:"Dictionary:.my_dict"',
      matching_results: 0,
      aggregations: [
        {
          type: 'term',
          field: 'enriched_t(ext).entities.text',
          count: 4,
          name: 'dict_yqYQPpM8OljE'
        }
      ]
    }
  ];
