import { QueryResultWithOptionalMetadata } from 'components/DocumentPreview/types';
import get from 'lodash/get';

export const getDocumentTitle = (
  document: QueryResultWithOptionalMetadata | undefined,
  titleField: string
): string => {
  if (document) {
    let title =
      get(document, titleField) ||
      get(document, 'extracted_metadata.title') ||
      get(document, 'extracted_metadata.filename') ||
      document.document_id;
    if (Array.isArray(title)) {
      title = title[0]; // only first element will be shown if title is array
    } else if (typeof title === 'object') {
      if (title.hasOwnProperty('text') && typeof get(title, 'text') === 'string') {
        // if title is an object return 'text' field if it exists
        title = get(title, 'text');
      } else {
        // else return toString to prevent the component from crashing
        title = title.toString();
      }
    }
    return title;
  }
  return '';
};
