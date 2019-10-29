import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';

export const configurationWithOneField: DiscoveryV2.Term[] = [
  {
    field: 'enriched_text.keywords',
    count: 10
  }
];

export const configurationWithTwoFields: DiscoveryV2.Term[] = [
  {
    field: 'enriched_text.keywords',
    count: 10
  },
  {
    field: 'author',
    count: 5
  }
];

export const configurationWithoutCounts: DiscoveryV2.Term[] = [
  {
    field: 'enriched_text.keywords'
  },
  {
    field: 'author'
  }
];
