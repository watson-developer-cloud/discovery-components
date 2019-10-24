import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

interface Filter extends DiscoveryV1.QueryAggregation {
  match?: string;
}

interface Nested extends DiscoveryV1.QueryAggregation {
  path?: string;
}

// TODO - merge this logic into SDK definition
interface QueryAggregation
  extends Omit<DiscoveryV1.QueryAggregation, 'aggregations'>,
    DiscoveryV1.Term,
    Filter,
    Nested {
  aggregations?: QueryAggregation[];
}
interface QueryResponse extends Omit<DiscoveryV1.QueryResponse, 'aggregations'> {
  aggregations?: QueryAggregation[];
}

export const twoTermAggs: QueryResponse = {
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

export const nestedTermAgg: QueryResponse = {
  aggregations: [
    {
      type: 'nested',
      path: 'enriched_text.entities',
      matching_results: 225809185,
      aggregations: [
        {
          type: 'term',
          field: 'enriched_text.entities.text',
          results: [
            {
              key: 'United States',
              matching_results: 863358
            },
            {
              key: 'Twitter',
              matching_results: 825192
            }
          ]
        }
      ]
    }
  ]
};

export const nestedFilterTermAgg: QueryResponse = {
  aggregations: [
    {
      type: 'nested',
      path: 'enriched_text.entities',
      matching_results: 225809185,
      aggregations: [
        {
          type: 'filter',
          match: 'enriched_text.entities.text:!"United States"',
          matching_results: 224868657,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.text',
              results: [
                {
                  key: 'Twitter',
                  matching_results: 825192
                },
                {
                  key: 'Facebook',
                  matching_results: 793668
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const twoNestedFilterTermAgg: QueryResponse = {
  aggregations: [
    {
      type: 'nested',
      path: 'enriched_text.entities',
      matching_results: 225809185,
      aggregations: [
        {
          type: 'filter',
          match: 'enriched_text.entities.text:!"United States"',
          matching_results: 224868657,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.text',
              results: [
                {
                  key: 'Twitter',
                  matching_results: 825192
                },
                {
                  key: 'Facebook',
                  matching_results: 793668
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'nested',
      path: 'enriched_text.entities',
      matching_results: 225809185,
      aggregations: [
        {
          type: 'filter',
          match: 'enriched_text.entities.text:!"United States"',
          matching_results: 224868657,
          aggregations: [
            {
              type: 'term',
              field: 'enriched_text.entities.text',
              results: [
                {
                  key: 'Twitter',
                  matching_results: 825192
                },
                {
                  key: 'Facebook',
                  matching_results: 793668
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
