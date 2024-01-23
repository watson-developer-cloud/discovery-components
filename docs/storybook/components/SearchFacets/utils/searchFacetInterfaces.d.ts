import DiscoveryV2 from 'ibm-watson/discovery/v2';
export interface QueryAggregationWithResults extends DiscoveryV2.QueryAggregation {
    results?: DiscoveryV2.QueryTermAggregationResult[];
}
export interface SelectableQueryTermAggregationResult extends DiscoveryV2.QueryTermAggregationResult {
    selected?: boolean;
    aggregations?: QueryAggregationWithResults[];
}
export declare const isSelectableQueryTermAggregationResult: (facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[]) => facets is SelectableQueryTermAggregationResult[];
export interface InternalQueryTermAggregation extends Omit<DiscoveryV2.QueryAggregationQueryTermAggregation, 'results'> {
    results?: SelectableQueryTermAggregationResult[];
    label?: string;
    name?: string;
    multiple_selections_allowed?: boolean;
}
export interface SearchFilterFacets {
    filterFields: InternalQueryTermAggregation[];
    filterDynamic: SelectableDynamicFacets[];
}
export interface SelectableDynamicFacets extends DiscoveryV2.QuerySuggestedRefinement {
    matching_results?: number;
    selected?: boolean;
    aggregations?: QueryAggregationWithResults[];
    key?: string;
}
export interface SelectedCollectionItems {
    selectedItems: CollectionItem[];
}
export interface CollectionItem {
    id: string;
    label: string;
}
export interface SelectedFacet {
    selectedFacetName: string;
    selectedFacetKey: string;
    checked: boolean;
}
export interface QueryAggregationWithName extends DiscoveryV2.QueryAggregation {
    type?: string;
    field?: string;
    count?: number;
    name?: string;
    path?: string;
    match?: string;
    aggregations?: QueryAggregationWithName[];
    matching_results?: number;
}
export declare const isQueryAggregationWithName: (aggregations?: (DiscoveryV2.QueryAggregation | QueryAggregationWithName)[]) => aggregations is QueryAggregationWithName[];
export interface SelectableFieldFacetWithCategory {
    key: string;
    matching_results?: number;
    selected: boolean;
}
export interface FieldFacetsByCategory {
    [facetLabel: string]: {
        categories: {
            [resultType: string]: {
                facets: SelectableFieldFacetWithCategory[];
            };
        };
    };
}
export interface FieldFacetsByCategoryEntity {
    [0]: string;
    [1]: {
        facets: SelectableFieldFacetWithCategory[];
    };
}
