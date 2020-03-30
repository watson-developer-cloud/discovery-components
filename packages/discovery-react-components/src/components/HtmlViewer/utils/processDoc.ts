import get from 'lodash/get';
import { isCsvFile, isJsonFile } from '../../DocumentPreview/utils/documentData';
import { processHtml } from './processHtml';
import { processText } from './processText';
import { isPassage } from '../../DocumentPreview/components/Highlight/passages';
import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';

export interface Options {
  sections?: boolean;
  tables?: boolean;
  bbox?: boolean;
  itemMap?: boolean;
  field?: string;
  highlight?: QueryResultPassage | QueryTableResult;
  //TODO colbyj properly type this
  enrichmentFields?: any;
}

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
  let { field, highlight } = options;
  if (document) {
    if (document.html) {
      return processHtml(document, options);
    } else {
      // JSON and CSV files will default to displaying the specified body field, `text` field, or passage highlighting field.
      // Otherwise an error is shown
      const isJsonOrCsvType = isJsonFile(document) || isCsvFile(document);
      if (
        isJsonOrCsvType &&
        (!highlight || !isPassage(highlight)) &&
        document[field] === undefined
      ) {
        // TODO colbyj return null or throw an Error?
        return null;
      } else {
        // text is based on the `field` value, unless it doesn't exist (falls back to `text`)
        let text = typeof document[field] === 'undefined' ? document.text || '' : document[field];

        if (!Array.isArray(text)) {
          text = [text];
        }

        let enrichments = [];
        if (options.enrichmentFields.length) {
          // TODO colbyj Always only use the first enrichment field?
          const { enrichmentPath, enrichmentFilter } = options.enrichmentFields[0];
          enrichments = [...get(document, enrichmentPath, [])];
          if (enrichmentFilter) {
            enrichments = enrichmentFilter(enrichments);
          }
        }

        return processText(text, enrichments);
      }
    }
  }
  // TODO colbyj return null or throw an Error?
  // TODO colbyj should simplify to a single return statement?
  return null;
}
