import DiscoveryV2 from 'ibm-watson/discovery/v2';

export interface SelectableQueryTermAggregationResult
  extends DiscoveryV2.QueryTermAggregationResult {
  selected?: boolean;
  aggregations?: any;
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
  aggregations?: any;
}

export interface SelectedCollectionItems {
  selectedItems: CollectionItem[];
}

export interface CollectionItem {
  id: string;
  label: string;
}
