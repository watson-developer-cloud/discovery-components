import get from 'lodash/get';
import partition from 'lodash/partition';
import { escapeFieldName, unescapeFieldName } from './escapeFieldName';
import {
  SearchFilterFacets,
  InternalQueryTermAggregation,
  SelectableQueryTermAggregationResult,
  SelectableDynamicFacets
} from './searchFacetInterfaces';
import { fieldHasCategories } from './fieldHasCategories';

/*
 * Utility class for creating and parsing query strings for search filters
 */

export class SearchFilterTransform {
  // Match any unescaped commas, colons, pipes
  static SPLIT_UNQUOTED_COMMAS = /,(?=(?:(?:[^"\\"]*["\\"]){2})*[^"\\"]*$)/;
  static SPLIT_UNQUOTED_COLONS = /::(?=(?:(?:[^"\\"]*["\\"]){2})*[^"\\"]*$)/;
  static SPLIT_UNQUOTED_PIPES = /\|(?=(?:(?:[^"\\"]*["\\"]){2})*[^"\\"]*$)/;
  // Match if the string is surrounded by parens
  // The substring inside of the parens will be in $1
  static STRING_IN_QUOTES = /^"(.+)"$/;

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

  // Returns a query string by combining field and dynamic query strings
  static toString(facets: SearchFilterFacets): string {
    const fieldFilters = this.fieldsToString(facets.filterFields);
    const dynamicFilters = this.quoteSelectedFacets(facets.filterDynamic, 'text').join(',');
    return [fieldFilters, dynamicFilters].filter(Boolean).join(',');
  }

  private static unquoteString(quotedString: string): string {
    return quotedString
      .replace(new RegExp(SearchFilterTransform.STRING_IN_QUOTES), '$1')
      .replace(/\\"/g, '"');
  }

  // Returns a full filter query string from the set of filterFields
  // Use the exact match query operator (::) for all fields
  // @see https://cloud.ibm.com/docs/discovery-data?topic=discovery-data-query-operators#match
  static fieldsToString(facets: InternalQueryTermAggregation[]): string {
    const filterStrings: string[] = [];
    facets.forEach(facet => {
      const field = get(facet, 'field', '');
      const results: SelectableQueryTermAggregationResult[] | [] = facet?.results || [];
      const hasCategories = fieldHasCategories({
        field,
        results
      });
      // if a group of facets contain sub-categories, surround each sub-category with an AND (,)
      if (hasCategories) {
        const resultsByCategory: Record<string, SelectableQueryTermAggregationResult[]> = {};
        results.forEach(result => {
          const resultCategory = result!.aggregations![0].results![0].key;
          if (resultCategory in resultsByCategory) {
            resultsByCategory[resultCategory].push(result);
          } else {
            resultsByCategory[resultCategory] = [result];
          }
        });
        Object.values(resultsByCategory).forEach(category => {
          const keys = this.quoteSelectedFacets(category, 'key');
          if (keys.length) {
            filterStrings.push(keys.map(key => `${escapeFieldName(field)}::${key}`).join('|'));
          }
        });
      } else {
        const keys = this.quoteSelectedFacets(results, 'key');
        if (keys.length) {
          filterStrings.push(keys.map(key => `${escapeFieldName(field)}::${key}`).join('|'));
        }
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
        // Add double quotes to make the query a phrase query
        // @see https://cloud.ibm.com/docs/discovery-data?topic=discovery-data-query-operators#phrase
        return `"${text.replace(/"/g, '\\"')}"`;
      });
  }
}
