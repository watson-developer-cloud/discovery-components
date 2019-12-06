import React, { FC, useContext, useEffect, useState } from 'react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { Button } from 'carbon-components-react';
import { settings } from 'carbon-components';
import Close from '@carbon/icons-react/lib/close/16';
import { SearchContext, SearchApi } from 'components/DiscoverySearch/DiscoverySearch';
import { mergeFilterFacets } from './utils/mergeFilterFacets';
import { mergeDynamicFacets } from './utils/mergeDynamicFacets';
import { SearchFilterTransform } from './utils/searchFilterTransform';
import { displayMessage, noAvailableFacetsMessage } from './utils/searchFacetMessages';
import { SearchFilterFacets, SelectableDynamicFacets } from './utils/searchFacetInterfaces';
import get from 'lodash/get';
import { CollectionFacets } from './components/CollectionFacets';
import { FieldFacets } from './components/FieldFacets';
import { DynamicFacets } from './components/DynamicFacets';
import { defaultMessages, Messages } from './messages';
import { useDeepCompareEffect } from 'utils/useDeepCompareMemoize';

interface SearchFacetsProps {
  /**
   * Show list of collections as facets
   */
  showCollections?: boolean;
  /**
   * Show list of dynamic facets
   */
  showDynamicFacets?: boolean;
  /**
   * Override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages?: Partial<Messages>;
  /**
   * Override aggregation component settings
   */
  overrideComponentSettingsAggregations?: DiscoveryV2.ComponentSettingsAggregation[];
  /**
   * Number of facet terms to show when list is collapsed
   */
  collapsedFacetsCount?: number;
}

export const SearchFacets: FC<SearchFacetsProps> = ({
  showCollections = true,
  showDynamicFacets = true,
  messages = defaultMessages,
  overrideComponentSettingsAggregations,
  collapsedFacetsCount = 5
}) => {
  const {
    aggregationResults,
    searchResponseStore: {
      parameters: searchParameters,
      parameters: { filter },
      data: searchResponse
    },
    collectionsResults,
    componentSettings
  } = useContext(SearchContext);
  const [facetSelectionState, setFacetSelectionState] = useState<SearchFilterFacets>(
    SearchFilterTransform.fromString(filter || '')
  );
  const { fetchAggregations, performSearch } = useContext(SearchApi);
  const aggregations = aggregationResults || [];
  const collections = (collectionsResults && collectionsResults.collections) || [];
  const mergedMessages = { ...defaultMessages, ...messages };
  const componentSettingsAggregations =
    overrideComponentSettingsAggregations ||
    (componentSettings && componentSettings.aggregations) ||
    [];

  useEffect(() => {
    fetchAggregations(searchParameters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParameters.aggregation]);

  useDeepCompareEffect(() => {
    if (filter === '') {
      setFacetSelectionState({ filterFields: [], filterDynamic: [] });
    }
  }, [aggregations, filter]);

  const allFieldFacets = mergeFilterFacets(
    aggregations,
    facetSelectionState.filterFields,
    componentSettingsAggregations
  );
  const allDynamicFacets: SelectableDynamicFacets[] = mergeDynamicFacets(
    get(searchResponse, 'suggested_refinements', []),
    facetSelectionState.filterDynamic
  );
  const shouldShowCollections = showCollections && !!collections;
  const shouldShowFields = !!allFieldFacets && allFieldFacets.length > 0;
  const shouldShowDynamic = showDynamicFacets && !!allDynamicFacets && allDynamicFacets.length > 0;
  const originalFilters = {
    filterFields: allFieldFacets,
    filterDynamic: allDynamicFacets
  };
  const hasFieldSelection = facetSelectionState.filterFields.some(aggregation => {
    return (
      aggregation.results &&
      aggregation.results.some(result => {
        return result.selected;
      })
    );
  });
  const hasDynamicSelection = facetSelectionState.filterDynamic.some(dynamicFacet => {
    return dynamicFacet.selected;
  });
  const hasSelection = hasFieldSelection || hasDynamicSelection;

  const handleOnChange = (updatedFacets: Partial<SearchFilterFacets>): void => {
    const newFilters = { ...originalFilters, ...updatedFacets };
    const filter = SearchFilterTransform.toString(newFilters);
    setFacetSelectionState(newFilters);
    performSearch({ ...searchParameters, offset: 0, filter }, false);
  };

  const handleOnClear = (): void => {
    setFacetSelectionState({ filterFields: [], filterDynamic: [] });
    performSearch({ ...searchParameters, collectionIds: [], offset: 0, filter: '' }, false);
  };

  if (shouldShowFields || shouldShowCollections) {
    return (
      <div>
        {hasSelection && (
          <Button
            className={`${settings.prefix}--search-facets__button-clear-all`}
            kind="ghost"
            renderIcon={Close}
            size="small"
            onClick={handleOnClear}
          >
            {messages.clearAllButtonText}
          </Button>
        )}
        {shouldShowFields && (
          <FieldFacets
            allFacets={allFieldFacets}
            onChange={handleOnChange}
            collapsedFacetsCount={collapsedFacetsCount}
            messages={mergedMessages}
          />
        )}
        {shouldShowDynamic && (
          <DynamicFacets
            dynamicFacets={allDynamicFacets}
            messages={mergedMessages}
            onChange={handleOnChange}
            collapsedFacetsCount={collapsedFacetsCount}
          />
        )}
        {shouldShowCollections && <CollectionFacets messages={mergedMessages} />}
      </div>
    );
  } else {
    return displayMessage(noAvailableFacetsMessage);
  }
};
