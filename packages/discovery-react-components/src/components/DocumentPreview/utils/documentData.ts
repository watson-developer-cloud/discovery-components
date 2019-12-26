import get from 'lodash/get';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { TextMappings } from '../types';

/**
 * Get `text_mappings` document property as an object. Usually, this
 * prop is stored as a JSON string; if so, parse and return as object.
 */
export function getTextMappings(
  doc: QueryResult | null | undefined
): TextMappings | null | undefined {
  let mappings = get(doc, 'extracted_metadata.text_mappings');
  if (mappings) {
    if (typeof mappings === 'string') {
      try {
        mappings = JSON.parse(mappings);
      } catch (err) {
        // fail gracefully
        console.error('Failure parsing text_mappings', err);
        mappings = null;
      }
    }
  }
  return mappings;
}
