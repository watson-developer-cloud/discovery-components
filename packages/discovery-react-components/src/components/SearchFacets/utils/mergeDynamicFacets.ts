import { SelectableDynamicFacets } from './searchFacetInterfaces';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import unionBy from 'lodash/unionBy';

export const mergeDynamicFacets = (
  dynamicFacets: DiscoveryV2.QuerySuggestedRefinement[],
  filterDynamicFacets: SelectableDynamicFacets[]
) => {
  if (!dynamicFacets) {
    return [];
  }

  const selectedDynamicFacets = filterDynamicFacets.filter(facet => facet.selected);
  const filteredAndDynamicFacets = unionBy(selectedDynamicFacets, dynamicFacets, 'text');
  return filteredAndDynamicFacets;
};
