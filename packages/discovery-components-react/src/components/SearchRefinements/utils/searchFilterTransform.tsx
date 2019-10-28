import get from 'lodash/get';
import { QueryTermAggregation, SelectableAggregationResult } from './searchRefinementInterfaces';

export class SearchFilterTransform {
  static SPLIT_UNQUOTED_COMMAS = /,(?=(?:(?:[^"\\"]*["\\"]){2})*[^"\\"]*$)/;
  static SPLIT_UNQUOTED_COLONS = /:(?=(?:(?:[^"\\"]*["\\"]){2})*[^"\\"]*$)/;
  static SPLIT_UNQUOTED_PIPES = /\|(?=(?:(?:[^"\\"]*["\\"]){2})*[^"\\"]*$)/;

  static fromString(filterString: string): QueryTermAggregation[] {
    if (filterString === '') {
      return [];
    }

    const refinementFields = filterString.split(SearchFilterTransform.SPLIT_UNQUOTED_COMMAS);
    return refinementFields.map(refinementField => {
      const refinementSplit = refinementField.split(SearchFilterTransform.SPLIT_UNQUOTED_COLONS);
      const field = refinementSplit[0];
      const results = refinementSplit[1]
        .split(SearchFilterTransform.SPLIT_UNQUOTED_PIPES)
        .sort()
        .map(result => {
          const unquotedResult = result.replace(/^"(.+)"$/, '$1').replace(/\\"/, '"');
          return {
            key: unquotedResult,
            matching_results: 1,
            selected: true
          };
        });

      return {
        field: field,
        results: results
      };
    });
  }

  static toString(refinements: QueryTermAggregation[]): string {
    const filterStrings: string[] = [];
    refinements.map(refinement => {
      const field = get(refinement, 'field', '');
      const results = get(refinement, 'results', []);
      const keys = results
        .filter((result: SelectableAggregationResult) => result.selected)
        .map((result: SelectableAggregationResult) => {
          const key = result.key || '';
          return `"${key.replace(/"/, '\\"')}"`;
        });
      if (keys.length) {
        filterStrings.push(`${field}:${keys.join('|')}`);
      }
    });
    return filterStrings.join(',');
  }
}
