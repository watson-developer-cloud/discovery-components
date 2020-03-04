import DiscoveryV2 from 'ibm-watson/discovery/v2';
import get from 'lodash/get';

export const getDocumentTitle = (
  document: DiscoveryV2.QueryResult | undefined,
  titleField: string
): string => {
  if (document) {
    return (
      document[titleField] ||
      get(document, 'extracted_metadata.title') ||
      get(document, 'extracted_metadata.filename') ||
      document.document_id
    );
  }
  return '';
};
