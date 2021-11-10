import { TextMappings } from 'components/DocumentPreview/types';
import { getTextMappings } from 'components/DocumentPreview/utils/documentData';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { processDoc, ProcessedDoc } from 'utils/document';
import { Location } from 'utils/document/processDoc';
import { DocumentFields, TextSpan } from '../../types';

export function getDocFieldValue(
  document: DocumentFields,
  field: string,
  index?: number,
  span?: Location | TextSpan
) {
  let fieldText: string | undefined;

  const documentFieldArray = document[field];
  if (!Array.isArray(documentFieldArray) && !index) {
    fieldText = documentFieldArray;
  } else {
    fieldText = documentFieldArray?.[index ?? 0];
  }
  if (!fieldText || !span) {
    return fieldText;
  }

  if (Array.isArray(span)) {
    return fieldText.substring(span[0], span[1]);
  } else {
    return fieldText.substring(span.begin, span.end);
  }
}

export type ExtractedDocumentInfo = {
  processedDoc: ProcessedDoc;
  textMappings?: TextMappings;
};

export async function extractDocumentInfo(document: QueryResult) {
  const docHtml = document.html;
  const textMappings = getTextMappings(document) ?? undefined;

  // HtmlView.tsx
  const processedDoc = await processDoc(
    { ...document, docHtml },
    { sections: true, bbox: true, bboxInnerText: true }
  );

  if (!processedDoc.bboxes) {
    throw Error('Unexpected result from processDoc');
  }

  return { processedDoc, textMappings };
}
