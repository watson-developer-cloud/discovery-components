import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

// TODO: Figure out why Term isn't inheriting from QueryAggregation
export interface QueryTermAggregation extends DiscoveryV1.QueryAggregation, DiscoveryV1.Term {
  selected?: boolean;
}

export interface SelectableAggregationResult extends DiscoveryV1.AggregationResult {
  selected?: boolean;
}
