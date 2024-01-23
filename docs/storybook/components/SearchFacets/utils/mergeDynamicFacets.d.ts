import { SelectableDynamicFacets } from './searchFacetInterfaces';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
export declare const mergeDynamicFacets: (dynamicFacets: DiscoveryV2.QuerySuggestedRefinement[], filterDynamicFacets: SelectableDynamicFacets[]) => DiscoveryV2.QuerySuggestedRefinement[];
