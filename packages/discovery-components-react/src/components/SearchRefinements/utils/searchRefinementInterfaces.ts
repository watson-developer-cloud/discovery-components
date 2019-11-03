import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';

export interface SelectableQueryTermAggregationResult
  extends DiscoveryV2.QueryTermAggregationResult {
  selected?: boolean;
}

// Maybe there's a better name for this now?
export interface SelectableQueryTermAggregation
  extends Omit<DiscoveryV2.QueryTermAggregation, 'results'> {
  results?: SelectableQueryTermAggregationResult[];
  label?: string;
  // Keeping this as snake to match the SDK, otherwise this becomes a headache
  // of toggling between two cases.
  multiple_selections_allowed?: boolean;
}

export interface SearchFilterRefinements {
  filterFields: SelectableQueryTermAggregation[];
  filterSuggested: DiscoveryV2.QuerySuggestedRefinement[];
}

export interface SelectableQuerySuggestedRefinement extends DiscoveryV2.QuerySuggestedRefinement {
  selected?: boolean;
}

export interface AggregationSettings extends Partial<DiscoveryV2.ComponentSettingsAggregation> {
  field: string;
}
