import { InternalQueryTermAggregation } from './searchFacetInterfaces';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
export declare const mergeFilterFacets: (aggregations: DiscoveryV2.QueryAggregation[] | null, filterFields: InternalQueryTermAggregation[], componentSettingsAggregations: DiscoveryV2.ComponentSettingsAggregation[]) => InternalQueryTermAggregation[];
