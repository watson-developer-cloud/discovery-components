import DiscoveryV1 from 'ibm-watson/discovery/v1';

// TODO: We should be able to remove this once we switch back over to the generated node sdk since
// we can add this combination of DiscoveryV1.QueryAggregation and DiscoveryV1.Term in there.
export interface QueryTermAggregation extends DiscoveryV1.QueryAggregation, DiscoveryV1.Term {
  field?: string;
  count?: number;
}
