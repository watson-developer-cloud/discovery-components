import get from 'lodash/get';
import partition from 'lodash/partition';
import {
  SearchFilterFacets,
  InternalQueryTermAggregation,
  SelectableQueryTermAggregationResult,
  SelectableDynamicFacets
} from '@SearchFacets/utils/searchFacetInterfaces';

export class SearchFilterTransform {
  static SPLIT_UNQUOTED_COMMAS = /,(?=(?:(?:[^"\\"]*["\\"]){2})*[^"\\"]*$)/;
  static SPLIT_UNQUOTED_COLONS = /:(?=(?:(?:[^"\\"]*["\\"]){2})*[^"\\"]*$)/;
  static SPLIT_UNQUOTED_PIPES = /\|(?=(?:(?:[^"\\"]*["\\"]){2})*[^"\\"]*$)/;

  static fromString(filterString: string): SearchFilterFacets {
    if (filterString === '') {
      return {
        filterFields: [],
        filterDynamic: []
      };
    }

    const colonRegex = RegExp(SearchFilterTransform.SPLIT_UNQUOTED_COLONS);
    const filterFacets = partition(
      filterString.split(SearchFilterTransform.SPLIT_UNQUOTED_COMMAS),
      filter => colonRegex.test(filter)
    );
    const fields = filterFacets[0].map(facetField => {
      const facetSplit = facetField.split(SearchFilterTransform.SPLIT_UNQUOTED_COLONS);
      const field = facetSplit[0];
      const results = facetSplit[1]
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
        type: 'term',
        field,
        results
      };
    });

    const suggestions = filterFacets[1].map(suggestion => {
      const unquotedSuggestion = this.unquoteString(suggestion);
      return {
        text: unquotedSuggestion,
        selected: true
      };
    });

    return {
      filterFields: fields,
      filterDynamic: suggestions
    };
  }

  static toString(facets: SearchFilterFacets): string {
    const fieldFilters = this.fieldsToString(facets.filterFields);
    const dynamicFilters = this.quoteSelectedFacets(facets.filterDynamic, 'text').join(',');
    return [fieldFilters, dynamicFilters].filter(Boolean).join(',');
  }

  private static unquoteString(quotedString: string): string {
    return quotedString.replace(/^"(.+)"$/, '$1').replace(/\\"/, '"');
  }

  static fieldsToString(facets: InternalQueryTermAggregation[]): string {
    const filterStrings: string[] = [];
    facets.map(facet => {
      const field = get(facet, 'field', '');
      const results = get(facet, 'results', []);
      const keys = this.quoteSelectedFacets(results, 'key');
      if (keys.length) {
        filterStrings.push(`${field}:${keys.join('|')}`);
      }
    });
    return filterStrings.join(',');
  }

  private static quoteSelectedFacets(
    facets: (SelectableQueryTermAggregationResult | SelectableDynamicFacets)[],
    key: string
  ): string[] {
    return facets
      .filter(result => result.selected)
      .map(result => {
        const text = get(result, key, '');
        return `"${text.replace(/"/, '\\"')}"`;
      });
  }
}
