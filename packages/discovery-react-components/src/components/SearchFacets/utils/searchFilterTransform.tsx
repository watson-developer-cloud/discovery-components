import get from 'lodash/get';
import partition from 'lodash/partition';
import { escapeFieldName, unescapeFieldName } from './escapeFieldName';
import {
  SearchFilterFacets,
  InternalQueryTermAggregation,
  SelectableQueryTermAggregationResult,
  SelectableDynamicFacets
} from './searchFacetInterfaces';

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
      const facets = facetField.split(SearchFilterTransform.SPLIT_UNQUOTED_PIPES);
      const field = facets[0].split(SearchFilterTransform.SPLIT_UNQUOTED_COLONS)[0];
      const results = facets
        .map(facet => {
          const facetPair = facet.split(SearchFilterTransform.SPLIT_UNQUOTED_COLONS);
          return facetPair[1];
        })
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
        field: unescapeFieldName(field),
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
    facets.forEach(facet => {
      const field = get(facet, 'field', '');
      const results = get(facet, 'results', []);
      const keys = this.quoteSelectedFacets(results, 'key');
      if (keys.length) {
        filterStrings.push(keys.map(key => `${escapeFieldName(field)}::${key}`).join('|'));
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
        return `${text.replace(/"/, '\\"')}`;
      });
  }
}
