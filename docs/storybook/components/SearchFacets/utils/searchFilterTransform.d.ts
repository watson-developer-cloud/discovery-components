import { SearchFilterFacets, InternalQueryTermAggregation } from './searchFacetInterfaces';
export declare class SearchFilterTransform {
    static SPLIT_UNQUOTED_COMMAS: RegExp;
    static SPLIT_UNQUOTED_COLONS: RegExp;
    static SPLIT_UNQUOTED_PIPES: RegExp;
    static STRING_IN_QUOTES: RegExp;
    static fromString(filterString: string): SearchFilterFacets;
    static toString(facets: SearchFilterFacets): string;
    private static unquoteString;
    static fieldsToString(facets: InternalQueryTermAggregation[]): string;
    private static quoteSelectedFacets;
}
