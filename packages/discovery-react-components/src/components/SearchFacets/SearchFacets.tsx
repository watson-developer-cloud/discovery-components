import React, { FC, useContext, useState, SyntheticEvent, useMemo } from 'react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { Button } from 'carbon-components-react';
import { settings } from 'carbon-components';
import { Close16 } from '@carbon/icons-react';
import { SearchContext, SearchApi } from 'components/DiscoverySearch/DiscoverySearch';
import { mergeFilterFacets } from './utils/mergeFilterFacets';
import { mergeDynamicFacets } from './utils/mergeDynamicFacets';
import { SearchFilterTransform } from './utils/searchFilterTransform';
import {
  displayMessage,
  noAvailableFacetsMessage,
  errorMessage
} from './utils/searchFacetMessages';
import {
  SearchFilterFacets,
  SelectableDynamicFacets,
  SelectedCollectionItems
} from './utils/searchFacetInterfaces';
import get from 'lodash/get';
import { v4 as uuidv4 } from 'uuid';
import { CollectionFacets } from './components/CollectionFacets';
import { FieldFacets } from './components/FieldFacets';
import { DynamicFacets } from './components/DynamicFacets';
import { defaultMessages, Messages } from './messages';
import { useDeepCompareEffect } from 'utils/useDeepCompareMemoize';
import { collectionFacetIdPrefix } from './cssClasses';
import onErrorCallback from 'utils/onErrorCallback';
import { FallbackComponent } from 'utils/FallbackComponent';
import { withErrorBoundary } from 'react-error-boundary';

interface SearchFacetsProps {
  /**
   * ID for the SearchFacets
   */
  id?: string;
  /**
   * Show list of collections as facets
   */
  showCollections?: boolean;
  /**
   * Show list of dynamic facets
   */
  showDynamicFacets?: boolean;
  /**
   * Show matching documents count as part of label
   */
  showMatchingResults?: boolean;
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
  /**
   * Override default message displayed when receiving an error on server request
   */
  serverErrorMessage?: React.ReactNode;
  /**
   * Custom handler invoked when any input element changes in the SearchFacets component.
   * Takes a synthethic event from an HTML Input Element or a string array from custom
   * onChange events that do not use synthethic events.
   */
  onChange?: (e: SyntheticEvent<HTMLInputElement> | string[]) => void;
}

const SearchFacets: FC<SearchFacetsProps> = ({
  id,
  showCollections = true,
  showDynamicFacets = true,
  showMatchingResults = false,
  messages = defaultMessages,
  overrideComponentSettingsAggregations,
  collapsedFacetsCount = 5,
  serverErrorMessage,
  onChange
}) => {
  const facetsId = useMemo(() => id || `search-facets__${uuidv4()}`, [id]);

  const {
    searchResponseStore: {
      parameters: searchParameters,
      parameters: { filter, collectionIds },
      data: searchResponse
    },
    collectionsResults,
    componentSettings,
    globalAggregationsResponseStore: {
      isLoading,
      isError,
      data: aggregations,
      parameters: globalAggregationsParameters
    }
  } = useContext(SearchContext);

  const [facetSelectionState, setFacetSelectionState] = useState<SearchFilterFacets>(
    SearchFilterTransform.fromString(filter || '')
  );

  const collections: DiscoveryV2.Collection[] = get(collectionsResults, 'collections', []);
  const initialSelectedCollectionIds = collectionIds || [];

  const initialSelectedCollections = collections
    .filter(collection => {
      return (
        !!collection.collection_id &&
        initialSelectedCollectionIds.includes(collection.collection_id)
      );
    })
    .map(collection => {
      return {
        id: `${collectionFacetIdPrefix}${collection.collection_id}`,
        label: collection.name || ''
      };
    });

  const [collectionSelectionState, setCollectionSelectionState] = useState<
    SelectedCollectionItems['selectedItems']
  >(initialSelectedCollections);

  const { performSearch, fetchAggregations } = useContext(SearchApi);
  const mergedMessages = { ...defaultMessages, ...messages };

  const componentSettingsAggregations =
    overrideComponentSettingsAggregations ||
    (componentSettings && componentSettings.aggregations) ||
    [];

  useDeepCompareEffect(() => {
    if (!aggregations && !isError && !isLoading) {
      fetchAggregations(globalAggregationsParameters);
    }
  }, [fetchAggregations, globalAggregationsParameters, aggregations, isError, isLoading]);

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
  const hasCollectionSelection = collectionSelectionState.length > 0;
  const hasSelection = hasFieldSelection || hasDynamicSelection || hasCollectionSelection;

  const handleOnSearchFacetsChange = (updatedFacets: Partial<SearchFilterFacets>): void => {
    const newFilters = { ...originalFilters, ...updatedFacets };
    const filter = SearchFilterTransform.toString(newFilters);
    setFacetSelectionState(newFilters);
    performSearch({ ...searchParameters, offset: 0, filter }, false);
  };

  const handleCollectionToggle = (selectedCollectionItems: SelectedCollectionItems) => {
    setCollectionSelectionState(selectedCollectionItems.selectedItems);
    // Filtering by id !== undefined still threw TS errors, so had to default
    // to '' and filter on that
    const collectionIds = selectedCollectionItems.selectedItems
      .map(collection => {
        return collection.id.split(collectionFacetIdPrefix).pop() || '';
      })
      .filter(id => id !== '');

    if (onChange) {
      // returning collection labels
      onChange(
        selectedCollectionItems.selectedItems
          .map(collection => {
            return collection.label.split(collectionFacetIdPrefix).pop() || '';
          })
          .filter(label => label !== '')
      );
    }

    performSearch({ ...searchParameters, offset: 0, collectionIds });
  };

  const handleOnClear = (event: SyntheticEvent<HTMLInputElement>): void => {
    if (onChange) {
      onChange(event);
    }

    setFacetSelectionState({ filterFields: [], filterDynamic: [] });
    setCollectionSelectionState([]);

    // TODO We should update to not select with a click
    // when Carbon MultiSelect selection can be controlled and Downshift's action props are exposed
    (
      document.querySelectorAll(
        `#${facetsId} .${settings.prefix}--tag--filter [role="button"]`
      ) as NodeListOf<HTMLElement>
    ).forEach(element => element.click());

    performSearch({ ...searchParameters, collectionIds: [], offset: 0, filter: '' }, false);
  };

  if (isLoading && !shouldShowFields && !shouldShowCollections) {
    return null;
  } else if (isError) {
    const errorNode =
      typeof serverErrorMessage === 'string'
        ? displayMessage(serverErrorMessage)
        : serverErrorMessage || displayMessage(errorMessage);
    return <> {errorNode} </>;
  } else if (shouldShowFields || shouldShowCollections) {
    return (
      <div id={facetsId} className={`${settings.prefix}--search-facets`}>
        {hasSelection && (
          <Button
            className={`${settings.prefix}--search-facets__button-clear-all`}
            id={`${facetsId}--search-facets-button-clear-all`}
            kind="ghost"
            renderIcon={Close16}
            size="small"
            onClick={handleOnClear}
          >
            {messages.clearAllButtonText}
          </Button>
        )}
        {shouldShowFields && (
          <FieldFacets
            allFacets={allFieldFacets}
            showMatchingResults={showMatchingResults}
            onChange={onChange}
            onFieldFacetsChange={handleOnSearchFacetsChange}
            collapsedFacetsCount={collapsedFacetsCount}
            messages={mergedMessages}
          />
        )}
        {shouldShowDynamic && (
          <DynamicFacets
            dynamicFacets={allDynamicFacets}
            showMatchingResults={showMatchingResults}
            messages={mergedMessages}
            onChange={onChange}
            onDynamicFacetsChange={handleOnSearchFacetsChange}
            collapsedFacetsCount={collapsedFacetsCount}
          />
        )}
        {shouldShowCollections && (
          <CollectionFacets
            initialSelectedCollections={initialSelectedCollections}
            messages={mergedMessages}
            onChange={handleCollectionToggle}
          />
        )}
      </div>
    );
  } else {
    return displayMessage(noAvailableFacetsMessage);
  }
};

export default withErrorBoundary(SearchFacets, FallbackComponent('SearchFacets'), onErrorCallback);
