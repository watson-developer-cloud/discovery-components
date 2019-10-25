import get from 'lodash/get';
import { QueryTermAggregation, SelectableAggregationResult } from './searchRefinementInterfaces';

export class SearchFilterTransform {
  static fromString(filterString: string): QueryTermAggregation[] {
    if (filterString === '') {
      return [];
    }

    const refinementFields = filterString.split(',');
    return refinementFields.map(refinementField => {
      const refinementSplit = refinementField.split(':');
      const field = refinementSplit[0];
      const results = refinementSplit[1]
        .split('|')
        .sort()
        .map(result => {
          return {
            key: result,
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
        .map((result: SelectableAggregationResult) => result.key);
      if (keys.length) {
        filterStrings.push(`${field}:${keys.join('|')}`);
      }
    });
    return filterStrings.join(',');
  }
}
