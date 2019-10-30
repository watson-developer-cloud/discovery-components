import get from 'lodash/get';
import partition from 'lodash/partition';
import {
  QueryTermAggregation,
  SearchFilterRefinements,
  SelectableAggregationResult,
  SelectableSuggestedRefinement
} from './searchRefinementInterfaces';

export class SearchFilterTransform {
  static SPLIT_UNQUOTED_COMMAS = /,(?=(?:(?:[^"\\"]*["\\"]){2})*[^"\\"]*$)/;
  static SPLIT_UNQUOTED_COLONS = /:(?=(?:(?:[^"\\"]*["\\"]){2})*[^"\\"]*$)/;
  static SPLIT_UNQUOTED_PIPES = /\|(?=(?:(?:[^"\\"]*["\\"]){2})*[^"\\"]*$)/;

  static fromString(filterString: string): SearchFilterRefinements {
    if (filterString === '') {
      return {
        filterFields: [],
        filterSuggested: []
      };
    }

    const colonRegex = RegExp(SearchFilterTransform.SPLIT_UNQUOTED_COLONS);
    const filterRefinements = partition(
      filterString.split(SearchFilterTransform.SPLIT_UNQUOTED_COMMAS),
      filter => colonRegex.test(filter)
    );
    const fields = filterRefinements[0].map(refinementField => {
      const refinementSplit = refinementField.split(SearchFilterTransform.SPLIT_UNQUOTED_COLONS);
      const field = refinementSplit[0];
      const results = refinementSplit[1]
        .split(SearchFilterTransform.SPLIT_UNQUOTED_PIPES)
        .sort()
        .map(result => {
          const unquotedResult = this.unquoteString(result);
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

    const suggestions = filterRefinements[1].map(suggestion => {
      const unquotedSuggestion = this.unquoteString(suggestion);
      return {
        text: unquotedSuggestion,
        selected: true
      };
    });

    return {
      filterFields: fields,
      filterSuggested: suggestions
    };
  }

  static toString(refinements: SearchFilterRefinements): string {
    const fieldFilters = this.fieldsToString(refinements.filterFields);
    const suggestedFilters = this.quoteSelectedRefinements(
      refinements.filterSuggested,
      'text'
    ).join(',');
    return [fieldFilters, suggestedFilters].filter(Boolean).join(',');
  }

  private static unquoteString(quotedString: string): string {
    return quotedString.replace(/^"(.+)"$/, '$1').replace(/\\"/, '"');
  }

  static fieldsToString(refinements: QueryTermAggregation[]): string {
    const filterStrings: string[] = [];
    refinements.map(refinement => {
      const field = get(refinement, 'field', '');
      const results = get(refinement, 'results', []);
      const keys = this.quoteSelectedRefinements(results, 'key');
      if (keys.length) {
        filterStrings.push(`${field}:${keys.join('|')}`);
      }
    });
    return filterStrings.join(',');
  }

  private static quoteSelectedRefinements(
    refinements: (SelectableAggregationResult | SelectableSuggestedRefinement)[],
    key: string
  ): string[] {
    return refinements
      .filter(result => result.selected)
      .map(result => {
        const text = get(result, key, '');
        return `"${text.replace(/"/, '\\"')}"`;
      });
  }
}
