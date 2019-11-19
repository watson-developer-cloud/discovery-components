import DiscoveryV2 from 'ibm-watson/discovery/v2';

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
