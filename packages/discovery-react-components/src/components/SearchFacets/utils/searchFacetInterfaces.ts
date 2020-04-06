import DiscoveryV2 from 'ibm-watson/discovery/v2';

export interface QueryAggregationWithResults extends DiscoveryV2.QueryAggregation {
  results?: DiscoveryV2.QueryTermAggregationResult;
}

export interface SelectableQueryTermAggregationResult
  extends DiscoveryV2.QueryTermAggregationResult {
  selected?: boolean;
  aggregations?: QueryAggregationWithResults[];
}

export interface InternalQueryTermAggregation
  extends Omit<DiscoveryV2.QueryTermAggregation, 'results'> {
  results?: SelectableQueryTermAggregationResult[];
  label?: string;
  name?: string;
  // Keeping this as snake to match the SDK, otherwise this becomes a headache
  // of toggling between two cases.
  multiple_selections_allowed?: boolean;
}

export interface SearchFilterFacets {
  filterFields: InternalQueryTermAggregation[];
  filterDynamic: SelectableDynamicFacets[];
}

export interface SelectableDynamicFacets extends DiscoveryV2.QuerySuggestedRefinement {
  selected?: boolean;
  aggregations?: QueryAggregationWithResults[];
  key?: string;
  matching_results?: number;
}

export interface SelectedCollectionItems {
  selectedItems: CollectionItem[];
}

export interface CollectionItem {
  id: string;
  label: string;
}

export interface QueryAggregationWithName extends DiscoveryV2.QueryAggregation {
  field?: string;
  count?: number;
  name?: string;
}

export interface SelectableFieldFacetWithType {
  key?: string;
  matching_results?: number;
  // field: string;
  selected: boolean;
}

export interface FieldFacetsByType {
  [facetLabel: string]: {
    // facetName?: string;
    categories: {
      [resultType: string]: {
        facets: SelectableFieldFacetWithType[];
      };
    };
  };
}
