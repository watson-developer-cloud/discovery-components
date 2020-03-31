import get from 'lodash/get';
import { isCsvFile, isJsonFile } from '../../DocumentPreview/utils/documentData';
import { processHtml } from './processHtml';
import { processText } from './processText';
import { Options } from '../types';
import { isPassage } from '../../DocumentPreview/components/Highlight/passages';
import { QueryResult } from 'ibm-watson/discovery/v2';

const DEFAULT_OPTIONS: Options = {
  sections: false,
  tables: false,
  bbox: false,
  itemMap: false,
  field: 'text',
  enrichmentFields: []
};

export function processDoc(document: QueryResult, options?: Options) {
  options = {
    ...DEFAULT_OPTIONS,
    ...(options || {})
  };

  // We know that `field` will be populated, either by the args or by the default
  let field = options.field!,
    highlight = options.highlight;

  if (document.html) {
    return processHtml(document, options);
  } else {
    // JSON and CSV files will default to displaying the specified body field, `text` field, or passage highlighting field.
    // Otherwise an error is shown
    const isJsonOrCsvType = isJsonFile(document) || isCsvFile(document);
    if (isJsonOrCsvType && (!highlight || !isPassage(highlight)) && document[field] === undefined) {
      throw new Error('There was no HTML or text to process in the document.');
    } else {
      // text is based on the `field` value, unless it doesn't exist
      // (falls back to `text`, throws an error if neither of these are populated)
      let text: string | string[];
      if (typeof document[field] !== 'undefined') {
        text = document[field];
      } else if (document.text) {
        text = document.text;
      } else {
        throw new Error('Document has no text to display.');
      }

      let enrichments: any[] = [];
      if (options.enrichmentFields && options.enrichmentFields.length) {
        // TODO colbyj Always only use the first enrichment field?
        const { path, filter } = options.enrichmentFields[0];
        enrichments = [...get(document, path, [])];
        if (filter) {
          enrichments = filter(enrichments);
        }
      }

      return processText(text, enrichments);
    }
  }
}
