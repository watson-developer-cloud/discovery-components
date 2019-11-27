import DiscoveryV2 from 'ibm-watson/discovery/v2';

export type SearchClient = Pick<
  DiscoveryV2,
  'query' | 'getAutocompletion' | 'listCollections' | 'getComponentSettings'
>;
