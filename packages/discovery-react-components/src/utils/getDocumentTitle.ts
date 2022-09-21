import { QueryResultWithOptionalMetadata } from 'components/DocumentPreview/types';
import get from 'lodash/get';

export const getDocumentTitle = (
  document: QueryResultWithOptionalMetadata | undefined,
  titleField: string
): string => {
  if (document) {
    return (
      get(document, titleField) ||
      get(document, 'extracted_metadata.title') ||
      get(document, 'extracted_metadata.filename') ||
      document.document_id
    );
  }
  return '';
};
