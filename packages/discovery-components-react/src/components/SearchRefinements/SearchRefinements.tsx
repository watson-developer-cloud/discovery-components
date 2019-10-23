import React, { FC, useContext } from 'react';
import { SearchContext, SearchApi } from '../DiscoverySearch/DiscoverySearch';
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
import { useDeepCompareEffect } from '../../utils/useDeepCompareMemoize';

interface SearchRefinementsProps {
  /**
   * Show list of collections as refinements
   */
  showCollections?: boolean;
  /**
   * label shown above the collection selection refinement control
   */
  collectionSelectLabel?: string;
  /**
   * tooltip text for collection selection refinement control
   */
  collectionSelectTitleText?: string;
  /**
   * Refinements configuration with fields and results counts
   */
  configuration: QueryTermAggregation[];
}

export const SearchRefinements: FC<SearchRefinementsProps> = ({
  showCollections,
  collectionSelectLabel = 'Available collections',
  collectionSelectTitleText = 'Collections',
  configuration
}) => {
  const {
    aggregationResults,
    searchParameters,
    searchParameters: { filter },
    collectionsResults
  } = useContext(SearchContext);
  const { fetchAggregations } = useContext(SearchApi);
  const aggregations = (aggregationResults && aggregationResults.aggregations) || [];
  const collections = (collectionsResults && collectionsResults.collections) || [];

  useDeepCompareEffect(() => {
    if (validateConfiguration(configuration)) {
      const aggregation = buildAggregationQuery(configuration);
      fetchAggregations({ ...searchParameters, aggregation });
    } else {
      consoleErrorMessage(invalidConfigurationMessage);
    }
  }, [configuration]);

  const allRefinements = mergeFilterRefinements(aggregations, filter || '', configuration);
  const shouldShowCollections = showCollections && !!collections;
  const shouldShowFields = !!allRefinements && allRefinements.length > 0;

  if (shouldShowFields || shouldShowCollections) {
    return (
      <div>
        {shouldShowCollections && (
          <CollectionRefinements
            label={collectionSelectLabel}
            titleText={collectionSelectTitleText}
          />
        )}
        {shouldShowFields && <FieldRefinements allRefinements={allRefinements} />}
      </div>
    );
  } else {
    return displayMessage(noAvailableRefinementsMessage);
  }
};
