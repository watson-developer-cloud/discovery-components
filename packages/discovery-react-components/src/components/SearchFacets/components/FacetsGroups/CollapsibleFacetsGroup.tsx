import React, { FC, useState, useEffect } from 'react';
import { Button } from 'carbon-components-react';
import filter from 'lodash/filter';
import get from 'lodash/get';
import ListBox from 'carbon-components-react/lib/components/ListBox';
import {
  fieldsetClasses,
  labelClasses,
  labelAndSelectionContainerClass
} from 'components/SearchFacets/cssClasses';
import {
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult,
  InternalQueryTermAggregation,
  FieldFacetsByCategory,
  isSelectableQueryTermAggregationResult
} from 'components/SearchFacets/utils/searchFacetInterfaces';
import { Messages } from 'components/SearchFacets/messages';
import { CategoryFacetsGroup } from './CategoryFacetsGroup';
import { MultiSelectFacetsGroup } from './MultiSelectFacetsGroup';
import { SingleSelectFacetsGroup } from './SingleSelectFacetsGroup';

interface CollapsibleFacetsGroupProps {
  /**
   * Facets configuration with fields and results counts
   */
  facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[];
  /**
   * Show matching documents count as part of label
   */
  showMatchingResults: boolean;
  /**
   * Aggregation component settings
   */
  aggregationSettings: InternalQueryTermAggregation;
  /**
   * How many facets should be shown
   */
  collapsedFacetsCount: number;
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * Facet text field
   */
  facetsTextField: 'key' | 'text';
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (selectedFacetName: string, selectedFacetKey: string, checked: boolean) => void;
  /**
   * Callback to reset selected facet
   */
  onClear: (selectedFacetName: string) => void;
  /**
   * Whether this is an enriched entities facet that includes categories by which to organize facet values
   */
  hasCategories: boolean;
}

export const CollapsibleFacetsGroup: FC<CollapsibleFacetsGroupProps> = ({
  facets,
  showMatchingResults,
  aggregationSettings,
  collapsedFacetsCount,
  facetsTextField,
  messages,
  onClear,
  onChange,
  hasCategories
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsedFacetsCount < facets.length);
  const [isCollapsible, setIsCollapsible] = useState<boolean>(collapsedFacetsCount < facets.length);
  const facetsLabel = aggregationSettings.label || aggregationSettings.field;

  useEffect(() => {
    setIsCollapsed(collapsedFacetsCount < facets.length);
    setIsCollapsible(collapsedFacetsCount < facets.length);
  }, [collapsedFacetsCount, facets.length]);

  const toggleFacetsCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  let facetsByCategory: FieldFacetsByCategory = {};
  if (hasCategories) {
    facetsByCategory[`${facetsLabel}`] = { categories: {} };
    if (isSelectableQueryTermAggregationResult(facets)) {
      facets.map(result => {
        const resultType = result!.aggregations![0].results![0].key;
        if (resultType in facetsByCategory[`${facetsLabel}`].categories) {
          facetsByCategory[`${facetsLabel}`].categories[`${resultType}`].facets.push({
            key: result.key,
            matching_results: result.matching_results,
            selected: result.selected ? result.selected : false
          });
        } else {
          facetsByCategory[`${facetsLabel}`].categories[`${resultType}`] = {
            facets: [
              {
                key: result.key,
                matching_results: result.matching_results,
                selected: result.selected ? result.selected : false
              }
            ]
          };
        }
      });
    }
  }

  const areMultiSelectionsAllowed = aggregationSettings.multiple_selections_allowed;
  const collapsedFacets = isCollapsed ? facets.slice(0, collapsedFacetsCount) : facets;
  const selectedFacets = filter(facets, ['selected', true]);
  const selectedFacetText = get(selectedFacets[0], facetsTextField, '');
  const shouldDisplayAsMultiSelect = areMultiSelectionsAllowed || selectedFacets.length > 1;
  const shouldDisplayClearButton = shouldDisplayAsMultiSelect && selectedFacets.length > 0;
  const handleClearFacets = (): void => {
    onClear(aggregationSettings.name || aggregationSettings.field);
  };

  const translateWithId = (id: string): string => {
    const mapping = {
      'clear.all': messages.clearFacetTitle,
      'clear.selection': messages.clearFacetSelectionTitle
    };
    return mapping[id];
  };

  return (
    <fieldset className={fieldsetClasses.join(' ')}>
      <legend className={labelClasses.join(' ')}>
        <div className={labelAndSelectionContainerClass}>
          {facetsLabel}
          {shouldDisplayClearButton && (
            <ListBox.Selection
              clearSelection={handleClearFacets}
              selectionCount={selectedFacets.length}
              translateWithId={translateWithId}
            />
          )}
        </div>
      </legend>
      {hasCategories ? (
        <CategoryFacetsGroup
          facetsByCategory={facetsByCategory}
          facetsLabel={facetsLabel}
          onChange={onChange}
          aggregationSettings={aggregationSettings}
          messages={messages}
          collapsedFacetsCount={collapsedFacetsCount}
          facetsTextField={facetsTextField}
          shouldDisplayAsMultiSelect={shouldDisplayAsMultiSelect}
          selectedFacet={selectedFacetText}
          showMatchingResults={showMatchingResults}
        />
      ) : (
        <>
          {shouldDisplayAsMultiSelect ? (
            <MultiSelectFacetsGroup
              messages={messages}
              facets={collapsedFacets}
              aggregationSettings={aggregationSettings}
              onChange={onChange}
              showMatchingResults={showMatchingResults}
              facetsTextField={facetsTextField}
            />
          ) : (
            <SingleSelectFacetsGroup
              messages={messages}
              facets={collapsedFacets}
              aggregationSettings={aggregationSettings}
              onChange={onChange}
              selectedFacet={selectedFacetText}
              showMatchingResults={showMatchingResults}
              facetsTextField={facetsTextField}
            />
          )}
          {isCollapsible && (
            <Button kind="ghost" size="small" onClick={toggleFacetsCollapse}>
              {isCollapsed
                ? messages.collapsedFacetShowMoreText
                : messages.collapsedFacetShowLessText}
            </Button>
          )}
        </>
      )}
    </fieldset>
  );
};
