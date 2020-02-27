import DiscoveryV2 from 'ibm-watson/discovery/v2';
import get from 'lodash/get';

export const getDocumentTitle = (
  resultTitleField: string,
  result?: DiscoveryV2.QueryResult
): string => {
  if (result) {
    const documentId: string | undefined = get(result, 'document_id');
    const filename: string | undefined = get(result, 'extracted_metadata.filename');
    const userSelectedTitle: string | undefined = get(result, resultTitleField);
    const title: string = userSelectedTitle
      ? userSelectedTitle
      : get(result, 'extracted_metadata.title') || filename || documentId;
    return title;
  }
  return 'No Title';
};
