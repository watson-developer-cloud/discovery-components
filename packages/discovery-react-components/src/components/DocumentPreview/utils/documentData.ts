import get from 'lodash/get';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { TextMappings, PreviewType, DiscoveryDocument } from '../types';

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

export function detectPreviewType(document: DiscoveryDocument, file?: string): PreviewType {
  const fileType = document.extracted_metadata?.file_type;
  const hasPassage = !!document.document_passages?.[0]?.passage_text;

  // if we have PDF data, render that
  // otherwise, render fallback document view
  if (fileType === 'pdf') {
    if (document.extracted_metadata.text_mappings) {
      // when using custom SDU model or OOB (CI) model
      if (file) {
        return 'PDF';
      }
    } else {
      // when using fast path
      if (!hasPassage && file) {
        return 'PDF';
      } else {
        return 'SIMPLE';
      }
    }
  }

  const isJsonType = isJsonFile(document);
  const isCsvType = isCsvFile(document);
  if (document.html && !isJsonType && !isCsvType) {
    return 'HTML';
  }

  return 'SIMPLE';
}
