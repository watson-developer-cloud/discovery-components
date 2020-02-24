import get from 'lodash/get';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { TextMappings } from '../types';

// document types
export const DOCUMENT_TYPES = {
  CSV_FILE: 'csv',
  JSON_FILE: 'json'
};

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
 * Get `file_type` document property as a string. Usually, this
 * prop is stored as a JSON string.
 */
export function getDocumentType(doc: QueryResult | null | undefined): string | null {
  let docType = get(doc, 'extracted_metadata.file_type');
  if (docType && typeof docType === 'string') {
    return docType;
  }
  return null;
}
