import { SelectableQuerySuggestedRefinement } from './searchRefinementInterfaces';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import unionBy from 'lodash/unionBy';

export const mergeSuggestedRefinements = (
  suggestedRefinements: DiscoveryV2.QuerySuggestedRefinement[],
  filterSuggested: SelectableQuerySuggestedRefinement[]
) => {
  if (!suggestedRefinements) {
    return [];
  }

  const filteredAndSuggestedRefinements = unionBy(filterSuggested, suggestedRefinements, 'text');
  return filteredAndSuggestedRefinements;
};
