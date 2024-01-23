import DiscoveryV2 from 'ibm-watson/discovery/v2';
/**
 * Look through each result in mock data and make sure the passage and bodyField text are the same length
 * as passageLength if passageLength is a valid value (between 50 and 2000)
 */
declare const trimSearchResults: (mockData: DiscoveryV2.QueryResponse, passageLength: number, bodyField: string) => DiscoveryV2.QueryResponse;
export default trimSearchResults;
