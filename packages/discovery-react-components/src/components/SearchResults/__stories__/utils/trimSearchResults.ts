import get from 'lodash/get';
import DiscoveryV2 from 'ibm-watson/discovery/v2';

/**
 * Look through each result in mock data and make sure the passage and bodyField text are the same length
 * as passageLength if passageLength is a valid value (between 50 and 2000)
 */
const trimSearchResults = (
  mockData: DiscoveryV2.QueryResponse,
  passageLength: number,
  bodyField: string
): DiscoveryV2.QueryResponse => {
  if (passageLength < 50 || passageLength > 2000) {
    return mockData;
  } else {
    (mockData.results as DiscoveryV2.QueryResult[]).forEach((result, i) => {
      let bodyText = get(result, `${bodyField}`);
      let passageText = get(result, 'document_passages[0].passage_text');
      if (bodyText) {
        bodyText = bodyText.substr(0, passageLength);
        (mockData.results as DiscoveryV2.QueryResult[])[i][bodyField] = bodyText;
      }
      if (passageText) {
        passageText = passageText.substr(0, passageLength);
        (mockData.results as any)[i].document_passages[0].passage_text = passageText;
      }
    });
    return mockData;
  }
};

export default trimSearchResults;
