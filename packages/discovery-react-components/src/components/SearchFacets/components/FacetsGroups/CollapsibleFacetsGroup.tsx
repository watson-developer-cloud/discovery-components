import React, { FC, useState, useEffect, SyntheticEvent } from 'react';
import filter from 'lodash/filter';
import get from 'lodash/get';
import ListBox from 'carbon-components-react/es/components/ListBox';
import {
  fieldsetClasses,
  labelClasses,
  labelAndSelectionContainerClass
} from 'components/SearchFacets/cssClasses';
import {
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult,
  InternalQueryTermAggregation,
  SelectedFacet,
  FieldFacetsByCategory,
  isSelectableQueryTermAggregationResult
} from 'components/SearchFacets/utils/searchFacetInterfaces';
import { Messages } from 'components/SearchFacets/messages';
import { CategoryFacetsGroup } from './CategoryFacetsGroup';
import { MultiSelectFacetsGroup } from './MultiSelectFacetsGroup';
import { SingleSelectFacetsGroup } from './SingleSelectFacetsGroup';
import { ShowMoreModal } from '../ShowMore/ShowMoreModal';
import { ShowMoreButton } from '../ShowMore/ShowMoreButton';
import { MAX_FACETS_UNTIL_MODAL, MAX_FACETS_UNTIL_SEARCHBAR } from '../../constants';

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
  onCollapsibleFacetsGroupChange: (selectedFacets: SelectedFacet[]) => void;
  /**
   * Callback to reset selected facet
   */
  onClear: (selectedFacetName: string) => void;
  /**
   * Whether this is an enriched entities facet that includes categories by which to organize facet values
   */
  hasCategories: boolean;
  /**
   * custom handler invoked when any input element changes in the SearchFacets component
   */
  onChange?: (e: SyntheticEvent<HTMLInputElement>) => void;
}

export const CollapsibleFacetsGroup: FC<CollapsibleFacetsGroupProps> = ({
  facets,
  showMatchingResults,
  aggregationSettings,
  collapsedFacetsCount,
  facetsTextField,
  messages,
  onClear,
  onCollapsibleFacetsGroupChange,
  onChange,
  hasCategories
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsedFacetsCount < facets.length);
  const [isCollapsible, setIsCollapsible] = useState<boolean>(collapsedFacetsCount < facets.length);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const facetsLabel = aggregationSettings.label || aggregationSettings.field;

  useEffect(() => {
    setIsCollapsed(collapsedFacetsCount < facets.length);
    setIsCollapsible(collapsedFacetsCount < facets.length);
  }, [collapsedFacetsCount, facets.length]);

  const toggleFacetsCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const setModalOpen = (): void => {
    setIsModalOpen(true);
  };

  let facetsByCategory: FieldFacetsByCategory = {};
  if (hasCategories) {
    facetsByCategory[`${facetsLabel}`] = { categories: {} };
    if (isSelectableQueryTermAggregationResult(facets)) {
      facets.forEach(result => {
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
  const totalNumberFacets = facets.length;
  const selectedFacets = filter(facets, ['selected', true]);
  const selectedFacetText = get(selectedFacets[0], facetsTextField, '');
  const shouldDisplayAsMultiSelect = areMultiSelectionsAllowed || selectedFacets.length > 1;
  const shouldDisplayClearButton = selectedFacets.length > 0;
  const showMoreButtonOnClick =
    totalNumberFacets <= MAX_FACETS_UNTIL_MODAL ? toggleFacetsCollapse : setModalOpen;
  const handleClearFacets = (event: SyntheticEvent<HTMLInputElement>): void => {
    if (onChange) {
      onChange(event);
    }
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
          onCategoryFacetsGroupChange={onCollapsibleFacetsGroupChange}
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
              onMultiSelectFacetsGroupChange={onCollapsibleFacetsGroupChange}
              showMatchingResults={showMatchingResults}
              facetsTextField={facetsTextField}
            />
          ) : (
            <SingleSelectFacetsGroup
              messages={messages}
              facets={collapsedFacets}
              aggregationSettings={aggregationSettings}
              onChange={onChange}
              onSingleSelectFacetsGroupChange={onCollapsibleFacetsGroupChange}
              selectedFacet={selectedFacetText}
              showMatchingResults={showMatchingResults}
              facetsTextField={facetsTextField}
            />
          )}
          {isCollapsible && (
            <>
              <ShowMoreButton
                onClick={showMoreButtonOnClick}
                idSuffix={facetsLabel}
                isCollapsed={isCollapsed}
                isShowAllMessage={totalNumberFacets > MAX_FACETS_UNTIL_MODAL}
                messages={messages}
              />
              {totalNumberFacets > MAX_FACETS_UNTIL_MODAL && (
                <ShowMoreModal
                  messages={messages}
                  aggregationSettings={aggregationSettings}
                  facets={facets}
                  facetsLabel={facetsLabel}
                  facetsTextField={facetsTextField}
                  onShowMoreModalChange={onCollapsibleFacetsGroupChange}
                  onChange={onChange}
                  isOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                  shouldDisplayAsMultiSelect={shouldDisplayAsMultiSelect}
                  selectedFacet={selectedFacetText}
                  hasSearchBar={totalNumberFacets > MAX_FACETS_UNTIL_SEARCHBAR}
                  showMatchingResults={showMatchingResults}
                />
              )}
            </>
          )}
        </>
      )}
    </fieldset>
  );
};
