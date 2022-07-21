import get from 'lodash/get';
import partition from 'lodash/partition';
import { escapeFieldName, unescapeFieldName } from './escapeFieldName';
import {
  SearchFilterFacets,
  InternalQueryTermAggregation,
  SelectableQueryTermAggregationResult,
  SelectableDynamicFacets
} from './searchFacetInterfaces';

/*
 * Utility class for creating and parsing query strings for search filters
 */

export class SearchFilterTransform {
  // Match any unescaped commas, colons, pipes
  static SPLIT_UNESCAPED_COMMAS = /(?<!\\),/;
  static SPLIT_UNESCAPED_COLONS = /(?<!\\):/;
  static SPLIT_UNESCAPED_PIPES = /(?<!\\)\|/;
  // Match if the string is surrounded by parens
  // The substring inside of the parens will be in $1
  static STRING_IN_PARENS = /^\((.+)\)$/;
  // Match any special characters
  // @see https://cloud.ibm.com/docs/discovery-data?topic=discovery-data-query-operators
  static CHARS_TO_ESCAPE = /[|",:()[\]<>^*~.!]/g;
  // Match any escaped special characters
  // The unescaped version of the character will be in $1
  static ESCAPED_CHAR = /\\([|",:()[\]<>^*~.!])/g;

  static fromString(filterString: string): SearchFilterFacets {
    if (filterString === '') {
      return {
        filterFields: [],
        filterDynamic: []
      };
    }

    const colonRegex = RegExp(SearchFilterTransform.SPLIT_UNESCAPED_COLONS);
    const filterFacets = partition(
      filterString.split(SearchFilterTransform.SPLIT_UNESCAPED_COMMAS),
      filter => colonRegex.test(filter)
    );
    const fields = filterFacets[0].map(facetField => {
      const facets = facetField.split(SearchFilterTransform.SPLIT_UNESCAPED_PIPES);
      const field = facets[0].split(SearchFilterTransform.SPLIT_UNESCAPED_COLONS)[0];
      const results = facets
        .map(facet => {
          const facetPair = facet.split(SearchFilterTransform.SPLIT_UNESCAPED_COLONS);
          return facetPair[1];
        })
        .sort()
        .map(result => {
          const unescapedResult = this.unescapeString(result);
          return {
            key: unescapedResult,
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
      const unescapedSuggestion = this.unescapeString(suggestion);
      return {
        text: unescapedSuggestion,
        selected: true
      };
    });

    return {
      filterFields: fields,
      filterDynamic: suggestions
    };
  }

  // Returns a query string by combining field and dynamic query strings
  static toString(facets: SearchFilterFacets): string {
    const fieldFilters = this.fieldsToString(facets.filterFields);
    const dynamicFilters = this.escapeSelectedFacets(facets.filterDynamic, 'text').join(',');
    return [fieldFilters, dynamicFilters].filter(Boolean).join(',');
  }

  private static unescapeString(escapedString: string): string {
    // Remove the parentheses added by escapeSelectedFacets
    // Unescape the special characters within the string
    const unescapedString = escapedString
      .replace(RegExp(SearchFilterTransform.STRING_IN_PARENS), '$1')
      .replace(RegExp(SearchFilterTransform.ESCAPED_CHAR), '$1');
    return unescapedString;
  }

  // Returns a full filter query string from the set of filterFields
  // Use the includes query operator (:) for all fields
  // @see https://cloud.ibm.com/docs/discovery-data?topic=discovery-data-query-operators#includes
  static fieldsToString(facets: InternalQueryTermAggregation[]): string {
    const filterStrings: string[] = [];
    facets.forEach(facet => {
      const field = get(facet, 'field', '');
      const results = get(facet, 'results', []);
      const keys = this.escapeSelectedFacets(results, 'key');
      if (keys.length) {
        filterStrings.push(keys.map(key => `${escapeFieldName(field)}:${key}`).join('|'));
      }
    });
    return filterStrings.join(',');
  }

  private static escapeSelectedFacets(
    facets: (SelectableQueryTermAggregationResult | SelectableDynamicFacets)[],
    key: string
  ): string[] {
    const escapeRegex = RegExp(SearchFilterTransform.CHARS_TO_ESCAPE);
    return facets
      .filter(result => result.selected)
      .map(result => {
        const text = get(result, key, '');
        // Add parentheses to prevent query ambiguity without changing the query's meaning
        // Escape special characters within the string so they aren't parsed as part of the query
        return `(${text.replace(escapeRegex, '\\$&')})`;
      });
  }
}
