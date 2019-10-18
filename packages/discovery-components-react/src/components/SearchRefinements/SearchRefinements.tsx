import * as React from 'react';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';
import { buildAggregationQuery } from './utils/buildAggregationQuery';
import { mergeFilterRefinements } from './utils/mergeFilterRefinements';
import { validateConfiguration } from './utils/validateConfiguration';
import {
  displayMessage,
  consoleErrorMessage,
  noAvailableRefinementsMessage,
  invalidConfigurationMessage
} from './utils/searchRefinementMessages';
import { QueryTermAggregation } from './utils/searchRefinementInterfaces';
import { CollectionRefinements } from './components/CollectionRefinements';
import { FieldRefinements } from './components/FieldRefinements';

interface SearchRefinementsProps {
  /**
   * Show list of collections as refinements
   */
  showCollections?: boolean;
  /**
   * Refinements configuration with fields and results counts
   */
  configuration: QueryTermAggregation[];
}

export const SearchRefinements: React.FunctionComponent<SearchRefinementsProps> = ({
  showCollections,
  configuration
}) => {
  const searchContext = React.useContext(SearchContext);
  const {
    onRefinementsMount,
    onUpdateQueryOptions,
    aggregationResults: { aggregations },
    searchParameters: { filter },
    collectionsResults: { collections }
  } = searchContext;

  React.useEffect(() => {
    if (validateConfiguration(configuration)) {
      onUpdateQueryOptions({ aggregation: buildAggregationQuery(configuration) });
      onRefinementsMount();
    } else {
      consoleErrorMessage(invalidConfigurationMessage);
    }
  }, [configuration]);

  const allRefinements = mergeFilterRefinements(aggregations || [], filter || '', configuration);
  const shouldShowCollections = showCollections && !!collections;
  const shouldShowFields = !!allRefinements && allRefinements.length > 0;

  if (shouldShowFields || shouldShowCollections) {
    return (
      <div>
        {shouldShowCollections && <CollectionRefinements />}
        {shouldShowFields && <FieldRefinements allRefinements={allRefinements} />}
      </div>
    );
  } else {
    return displayMessage(noAvailableRefinementsMessage);
  }
};
