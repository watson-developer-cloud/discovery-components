import React, { FC, useContext } from 'react';
import { SearchContext, SearchApi } from '../DiscoverySearch/DiscoverySearch';
import { buildAggregationQuery } from './utils/buildAggregationQuery';
import { mergeFilterRefinements } from './utils/mergeFilterRefinements';
import { mergeSuggestedRefinements } from './utils/mergeSuggestedRefinements';
import { validateConfiguration } from './utils/validateConfiguration';
import { SearchFilterTransform } from './utils/searchFilterTransform';
import {
  displayMessage,
  consoleErrorMessage,
  noAvailableRefinementsMessage,
  invalidConfigurationMessage
} from './utils/searchRefinementMessages';
import {
  QueryTermAggregation,
  SearchFilterRefinements,
  SelectableSuggestedRefinement
} from './utils/searchRefinementInterfaces';
import get from 'lodash/get';
import { CollectionRefinements } from './components/CollectionRefinements';
import { FieldRefinements } from './components/FieldRefinements';
import { useDeepCompareEffect } from '../../utils/useDeepCompareMemoize';
import { SuggestedRefinements } from './components/SuggestedRefinements';

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
   * Show list of suggested refinements
   */
  showSuggestedRefinements?: boolean;
  /**
   * Label used for suggested refinements group
   */
  suggestedRefinementsLabel?: string;
  /**
   * Refinements configuration with fields and results counts
   */
  configuration: QueryTermAggregation[];
}

export const SearchRefinements: FC<SearchRefinementsProps> = ({
  showCollections,
  collectionSelectLabel = 'Available collections',
  collectionSelectTitleText = 'Collections',
  showSuggestedRefinements,
  suggestedRefinementsLabel = 'Suggested Enrichments',
  configuration
}) => {
  const {
    aggregationResults,
    searchParameters,
    searchParameters: { filter },
    searchResponse,
    collectionsResults
  } = useContext(SearchContext);
  const { fetchAggregations, performSearch } = useContext(SearchApi);
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

  const { filterFields, filterSuggested } = SearchFilterTransform.fromString(filter || '');
  const allFieldRefinements = mergeFilterRefinements(aggregations, filterFields, configuration);
  const allSuggestedRefinements: SelectableSuggestedRefinement[] = mergeSuggestedRefinements(
    get(searchResponse, 'suggested_refinements', []),
    filterSuggested
  );
  const shouldShowCollections = showCollections && !!collections;
  const shouldShowFields = !!allFieldRefinements && allFieldRefinements.length > 0;
  const shouldShowSuggested = showSuggestedRefinements && !!allSuggestedRefinements;
  const originalFilters = {
    filterFields: allFieldRefinements,
    filterSuggested: allSuggestedRefinements
  };

  const handleOnChange = (updatedRefinements: Partial<SearchFilterRefinements>): void => {
    const newFilters = { ...originalFilters, ...updatedRefinements };
    const filter = SearchFilterTransform.toString(newFilters);
    performSearch({ ...searchParameters, offset: 0, filter }, false);
  };

  if (shouldShowFields || shouldShowCollections) {
    return (
      <div>
        {shouldShowCollections && (
          <CollectionRefinements
            label={collectionSelectLabel}
            titleText={collectionSelectTitleText}
          />
        )}
        {shouldShowFields && (
          <FieldRefinements allRefinements={allFieldRefinements} onChange={handleOnChange} />
        )}
        {shouldShowSuggested && (
          <SuggestedRefinements
            suggestedRefinements={allSuggestedRefinements}
            suggestedRefinementsLabel={suggestedRefinementsLabel}
            onChange={handleOnChange}
          />
        )}
      </div>
    );
  } else {
    return displayMessage(noAvailableRefinementsMessage);
  }
};
