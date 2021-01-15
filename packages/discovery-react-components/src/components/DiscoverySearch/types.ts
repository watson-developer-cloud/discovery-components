import DiscoveryV2 from 'ibm-watson/discovery/v2';

export type SearchClient = Pick<
  DiscoveryV2,
  'query' | 'getAutocompletion' | 'listCollections' | 'getComponentSettings' | 'listFields'
>;

export type SearchParams = Omit<DiscoveryV2.QueryParams, 'projectId' | 'headers'> & {
  /**
   * @deprecated "returnFields" has been renamed as "_return"
   */
  returnFields?: string[];
};
