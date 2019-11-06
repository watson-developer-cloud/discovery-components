import { SelectableDynamicFacets } from './searchFacetInterfaces';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import unionBy from 'lodash/unionBy';

export const mergeDynamicFacets = (
  dynamicFacets: DiscoveryV2.QuerySuggestedRefinement[],
  filterDynamicFacets: SelectableDynamicFacets[]
) => {
  if (!dynamicFacets) {
    return [];
  }

  const filteredAndDynamicFacets = unionBy(filterDynamicFacets, dynamicFacets, 'text');
  return filteredAndDynamicFacets;
};
