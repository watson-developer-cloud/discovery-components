import React, { FC, useContext, useEffect } from 'react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { Button } from 'carbon-components-react';
import { settings } from 'carbon-components';
import CloseOutline from '@carbon/icons-react/lib/close--outline/16.js';
import { SearchContext, SearchApi } from '../DiscoverySearch/DiscoverySearch';
import { mergeFilterFacets } from './utils/mergeFilterFacets';
import { mergeDynamicFacets } from './utils/mergeDynamicFacets';
import { SearchFilterTransform } from './utils/searchFilterTransform';
import { displayMessage, noAvailableFacetsMessage } from './utils/searchFacetMessages';
import { SearchFilterFacets, SelectableDynamicFacets } from './utils/searchFacetInterfaces';
import get from 'lodash/get';
import { CollectionFacets } from './components/CollectionFacets';
import { FieldFacets } from './components/FieldFacets';
import { DynamicFacets } from './components/DynamicFacets';
import defaultMessages, { Messages } from './messages';

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
   * i18n messages for the component
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

  const { filterFields, filterDynamic } = SearchFilterTransform.fromString(filter || '');
  const allFieldFacets = mergeFilterFacets(
    aggregations,
    filterFields,
    componentSettingsAggregations
  );
  const allDynamicFacets: SelectableDynamicFacets[] = mergeDynamicFacets(
    get(searchResponse, 'suggested_refinements', []),
    filterDynamic
  );
  const shouldShowCollections = showCollections && !!collections;
  const shouldShowFields = !!allFieldFacets && allFieldFacets.length > 0;
  const shouldShowDynamic = showDynamicFacets && !!allDynamicFacets && allDynamicFacets.length > 0;
  const originalFilters = {
    filterFields: allFieldFacets,
    filterDynamic: allDynamicFacets
  };

  const handleOnChange = (updatedFacets: Partial<SearchFilterFacets>): void => {
    const newFilters = { ...originalFilters, ...updatedFacets };
    const filter = SearchFilterTransform.toString(newFilters);
    performSearch({ ...searchParameters, offset: 0, filter }, false);
  };

  const handleOnClear = (): void => {
    performSearch({ ...searchParameters, collectionIds: [], offset: 0, filter: '' }, false);
  };

  if (shouldShowFields || shouldShowCollections) {
    return (
      <div>
        {filter && (
          <Button
            className={`${settings.prefix}--search-facets__button-clear-all`}
            kind="ghost"
            renderIcon={CloseOutline}
            size="small"
            onClick={handleOnClear}
          >
            <span>{messages.clearAllButtonText}</span>
          </Button>
        )}
        {shouldShowCollections && <CollectionFacets messages={mergedMessages} />}
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
      </div>
    );
  } else {
    return displayMessage(noAvailableFacetsMessage);
  }
};
