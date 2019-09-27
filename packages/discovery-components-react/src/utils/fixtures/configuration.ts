import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

export const configurationOne: Array<DiscoveryV1.Term> = [
  {
    field: 'enriched_text.keywords',
    count: 10
  }
];

export const configurationTwo: Array<DiscoveryV1.Term> = [
  {
    field: 'enriched_text.keywords',
    count: 10
  },
  {
    field: 'author',
    count: 5
  }
];
