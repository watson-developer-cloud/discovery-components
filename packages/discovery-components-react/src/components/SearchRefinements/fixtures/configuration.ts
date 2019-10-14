import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

export const configurationWithOneField: DiscoveryV1.Term[] = [
  {
    field: 'enriched_text.keywords',
    count: 10
  }
];

export const configurationWithTwoFields: DiscoveryV1.Term[] = [
  {
    field: 'enriched_text.keywords',
    count: 10
  },
  {
    field: 'author',
    count: 5
  }
];

export const configurationWithoutCounts: DiscoveryV1.Term[] = [
  {
    field: 'enriched_text.keywords'
  },
  {
    field: 'author'
  }
];
