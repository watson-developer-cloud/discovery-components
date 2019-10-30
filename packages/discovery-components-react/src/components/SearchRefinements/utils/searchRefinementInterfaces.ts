import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';

export interface SelectableQueryTermAggregationResult
  extends DiscoveryV2.QueryTermAggregationResult {
  selected?: boolean;
}

export interface SelectableQueryTermAggregation
  extends Omit<DiscoveryV2.QueryTermAggregation, 'results'> {
  results?: SelectableQueryTermAggregationResult[];
}

export interface SearchFilterRefinements {
  filterFields: SelectableQueryTermAggregation[];
  filterSuggested: DiscoveryV2.QuerySuggestedRefinement[];
}

export interface SelectableQuerySuggestedRefinement extends DiscoveryV2.QuerySuggestedRefinement {
  selected?: boolean;
}
