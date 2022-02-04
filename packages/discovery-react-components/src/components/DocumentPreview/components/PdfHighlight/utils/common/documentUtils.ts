import { TextMappings } from 'components/DocumentPreview/types';
import { getTextMappings } from 'components/DocumentPreview/utils/documentData';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { processDoc, ProcessedDoc } from 'utils/document';
import { Location } from 'utils/document/processDoc';
import { DocumentFields, TextSpan } from '../../types';

/**
 * Get value of the specified field from a search result document
 *
 * @param document search result document
 * @param field field name
 * @param index field index. 0 by default
 * @param span (optional) span on the field value to return. Returns entire the field value by default
 * @returns text
 */
export function getDocFieldValue(
  document: DocumentFields,
  field: string,
  index?: number,
  span?: Location | TextSpan
): string | undefined {
  let fieldText: string | object | undefined;

  const documentFieldArray = document[field];
  if (!Array.isArray(documentFieldArray) && !index) {
    fieldText = documentFieldArray;
  } else {
    fieldText = documentFieldArray?.[index ?? 0];
  }

  // to handle 'table' field's text mappings specially
  if (field === 'table' && typeof fieldText?.['table_text'] === 'string') {
    return fieldText['table_text'];
  }

  if (typeof fieldText !== 'string') {
    return undefined;
  } else if (!span) {
    return fieldText;
  } else if (Array.isArray(span)) {
    return fieldText.substring(span[0], span[1]);
  } else {
    return fieldText.substring(span.begin, span.end);
  }
}

export type ExtractedDocumentInfo = {
  processedDoc: ProcessedDoc;
  textMappings?: TextMappings;
};

/**
 * Extract bboxes and text_mappings from a search result document
 */
export async function extractDocumentInfo(
  document: QueryResult,
  options: { tables?: boolean } = {}
): Promise<ExtractedDocumentInfo> {
  const docHtml = document.html;
  const textMappings = getTextMappings(document) ?? undefined;

  const processedDoc = await processDoc(
    { ...document, docHtml },
    { sections: true, bbox: true, bboxInnerText: true, ...options }
  );

  if (!processedDoc.bboxes) {
    throw Error('Unexpected result from processDoc');
  }

  return { processedDoc, textMappings };
}
