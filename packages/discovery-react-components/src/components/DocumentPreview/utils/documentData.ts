import get from 'lodash/get';
import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import { DiscoveryDocument, DocumentFile, PreviewType, TextMappings } from '../types';
import { isTable } from '../components/Highlight/tables';

/**
 * Get `text_mappings` document property as an object. Usually, this
 * prop is stored as a JSON string; if so, parse and return as object.
 */
export function getTextMappings(
  doc: QueryResult | null | undefined
): TextMappings | null | undefined {
  let mappings = get(doc, 'extracted_metadata.text_mappings');
  if (mappings && typeof mappings === 'string') {
    try {
      mappings = JSON.parse(mappings);
    } catch (err) {
      // fail gracefully - text mapping cannot be parsed
      console.error('Failure parsing text_mappings', err);
      mappings = null;
    }
  } else {
    // text mapping is not a string or no mappings are present
    mappings = null;
  }
  return mappings;
}

/**
 * Returns true if the `file_type` is CSV
 */
export function isCsvFile(doc: QueryResult | null | undefined): boolean {
  return get(doc, 'extracted_metadata.file_type') === 'csv';
}

/**
 * Returns true if the `file_type` is JSON
 */
export function isJsonFile(doc: QueryResult | null | undefined): boolean {
  return get(doc, 'extracted_metadata.file_type') === 'json';
}

/**
 * Returns the preview type for document
 */
export function detectPreviewType(
  document: DiscoveryDocument,
  file?: DocumentFile,
  highlight?: QueryResultPassage | QueryTableResult
): PreviewType {
  const fileType = document.extracted_metadata?.file_type;
  // passages contain location offsets against text-based strings (not HTML)
  const hasPassage = highlight && 'passage_text' in highlight;
  const hasTextMappings = !!document.extracted_metadata?.text_mappings;
  const isHighlightTable = isTable(highlight);

  if (fileType === 'pdf' && file) {
    // When trying to highlight a passage, text_mappings are required to map
    // between passages' text-based offsets and the BBOX data need to highlight
    // on PDFs
    // When trying to highlight a table, text mappings aren't needed
    if (hasTextMappings || !hasPassage || isHighlightTable) {
      return 'PDF';
    }
  }

  const isJsonType = isJsonFile(document);
  const isCsvType = isCsvFile(document);
  if (document.html && !isJsonType && !isCsvType) {
    // When trying to highlight a passage, only show as HTML when the document has text_mappings.
    // (since HTML view cannot display a passage highlight unless the document have text_mappings)
    // When trying to highlight a table, text mappings aren't needed, so display HTML
    if (hasTextMappings || !hasPassage || isHighlightTable) {
      return 'HTML';
    }
  }

  return 'TEXT';
}
