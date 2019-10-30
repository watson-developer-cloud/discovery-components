import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';

// TODO: Figure out why Term isn't inheriting from QueryAggregation
export interface QueryTermAggregation extends DiscoveryV2.QueryAggregation, DiscoveryV2.Term {
  selected?: boolean;
}

export interface SelectableAggregationResult extends DiscoveryV2.AggregationResult {
  selected?: boolean;
}

export interface SearchFilterRefinements {
  filterFields: QueryTermAggregation[];
  filterSuggested: DiscoveryV2.QuerySuggestedRefinement[];
}

export interface SelectableSuggestedRefinement extends DiscoveryV2.QuerySuggestedRefinement {
  selected?: boolean;
}
