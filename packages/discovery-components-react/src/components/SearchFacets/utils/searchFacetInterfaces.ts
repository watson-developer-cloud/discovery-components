import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';

export interface SelectableQueryTermAggregationResult
  extends DiscoveryV2.QueryTermAggregationResult {
  selected?: boolean;
}

export interface InternalQueryTermAggregation
  extends Omit<DiscoveryV2.QueryTermAggregation, 'results'> {
  results?: SelectableQueryTermAggregationResult[];
  label?: string;
  // Keeping this as snake to match the SDK, otherwise this becomes a headache
  // of toggling between two cases.
  multiple_selections_allowed?: boolean;
}

export interface SearchFilterFacets {
  filterFields: InternalQueryTermAggregation[];
  filterDynamic: DiscoveryV2.QuerySuggestedRefinement[];
}

export interface SelectableDynamicFacets extends DiscoveryV2.QuerySuggestedRefinement {
  selected?: boolean;
}

export interface AggregationSettings extends Partial<DiscoveryV2.ComponentSettingsAggregation> {
  field: string;
}
