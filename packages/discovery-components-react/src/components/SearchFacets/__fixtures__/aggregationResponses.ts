import DiscoveryV2 from 'ibm-watson/discovery/v2';

const termAggregation1: DiscoveryV2.QueryTermAggregation = {
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
};
const termAggregation2: DiscoveryV2.QueryTermAggregation = {
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
};

export const twoTermAggs: DiscoveryV2.QueryResponse = {
  aggregations: [termAggregation1, termAggregation2]
};

const termAggregation3: DiscoveryV2.QueryTermAggregation = {
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
};
const nestedAggregation: DiscoveryV2.QueryNestedAggregation = {
  type: 'nested',
  path: 'enriched_text.entities',
  matching_results: 225809185,
  aggregations: [termAggregation3]
};
export const nestedTermAgg: DiscoveryV2.QueryResponse = {
  aggregations: [nestedAggregation]
};

const termAggregation4: DiscoveryV2.QueryTermAggregation = {
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
};
const filterAgg1: DiscoveryV2.QueryFilterAggregation = {
  type: 'filter',
  match: 'enriched_text.entities.text:!"United States"',
  matching_results: 224868657,
  aggregations: [termAggregation4]
};

const nestedAggregation2: DiscoveryV2.QueryNestedAggregation = {
  type: 'nested',
  path: 'enriched_text.entities',
  matching_results: 225809185,
  aggregations: [filterAgg1]
};

export const nestedFilterTermAgg: DiscoveryV2.QueryResponse = {
  aggregations: [nestedAggregation2]
};

export const twoNestedFilterTermAgg: DiscoveryV2.QueryResponse = {
  aggregations: [nestedAggregation2, nestedAggregation2]
};
