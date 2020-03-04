import DiscoveryV2 from 'ibm-watson/discovery/v2';
import get from 'lodash/get';

export const getDocumentTitle = (
  result: DiscoveryV2.QueryResult | undefined,
  resultTitleField: string
): string => {
  if (result) {
    return (
      result[resultTitleField] ||
      get(result, 'extracted_metadata.title') ||
      get(result, 'extracted_metadata.filename') ||
      result.document_id
    );
  }
  return '';
};
