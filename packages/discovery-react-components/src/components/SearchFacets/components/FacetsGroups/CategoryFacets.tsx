import React, { FC, useState, useEffect, SyntheticEvent } from 'react';
import { Button } from 'carbon-components-react';
import { ChevronDown16 } from '@carbon/icons-react';
import { ChevronUp16 } from '@carbon/icons-react';
import { Messages } from 'components/SearchFacets/messages';
import { MultiSelectFacetsGroup } from './MultiSelectFacetsGroup';
import { SingleSelectFacetsGroup } from './SingleSelectFacetsGroup';
import { ShowMoreModal } from '../ShowMore/ShowMoreModal';
import { ShowMoreButton } from '../ShowMore/ShowMoreButton';
import {
  categoryClass,
  categoryExpandCollapseClass,
  categoryGroupNameClass
} from 'components/SearchFacets/cssClasses';
import {
  InternalQueryTermAggregation,
  SelectableFieldFacetWithCategory,
  SelectedFacet
} from 'components/SearchFacets/utils/searchFacetInterfaces';
import { MAX_FACETS_UNTIL_MODAL, MAX_FACETS_UNTIL_SEARCHBAR } from '../../constants';

interface CategoryFacetsProps {
  /**
   * Name of the category group within the facet
   */
  categoryName: string;
  /**
   * Label for the facet
   */
  facetsLabel: string;
  /**
   * Facets for the category
   */
  facets: SelectableFieldFacetWithCategory[];
  /**
   * Facet text field
   */
  facetsTextField: 'key' | 'text';
  /**
   * Callback to handle changes in selected facets
   */
  onCategoryFacetsChange: (selectedFacets: SelectedFacet[]) => void;
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * If category is expanded or collapsed
   */
  categoryIsExpanded: boolean;
  /**
   * How many facets should be shown
   */
  collapsedFacetsCount: number;
  /**
   * Callback to handle changes in expansion/collapse of category group
   */
  onClick: (categoryName: string, facetLabel: string) => void;
  /**
   * Aggregation component settings
   */
  aggregationSettings: InternalQueryTermAggregation;
  /**
   * If should be displayed as multiselect or single-select
   */
  shouldDisplayAsMultiSelect: boolean;
  /**
   * Text of selected facet
   */
  selectedFacet: string;
  /**
   * Show matching documents count as part of label
   */
  showMatchingResults: boolean;
  /**
   * custom handler invoked when any input element changes in the SearchFacets component
   */
  onChange?: (e: SyntheticEvent<HTMLInputElement>) => void;
}

export const CategoryFacets: FC<CategoryFacetsProps> = ({
  categoryName,
  facetsLabel,
  facets,
  facetsTextField,
  onChange,
  onCategoryFacetsChange,
  messages,
  categoryIsExpanded,
  collapsedFacetsCount,
  onClick,
  aggregationSettings,
  shouldDisplayAsMultiSelect,
  selectedFacet,
  showMatchingResults
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [isCollapsible, setIsCollapsible] = useState<boolean>(collapsedFacetsCount < facets.length);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  const categoryFacetsToShow = isCollapsed ? facets.slice(0, collapsedFacetsCount) : facets;
  const iconToRender = categoryIsExpanded ? ChevronUp16 : ChevronDown16;
  const totalNumberFacets = facets.length;
  const showMoreButtonOnClick =
    totalNumberFacets <= MAX_FACETS_UNTIL_MODAL ? toggleFacetsCollapse : setModalOpen;

  return (
    <div className={categoryClass} data-testid={'search-facet-category'}>
      <Button
        className={categoryExpandCollapseClass}
        onClick={() => onClick(categoryName, facetsLabel)}
        iconDescription={messages.categoryExpandCollapseIconDescription}
        renderIcon={iconToRender}
      >
        <div className={categoryGroupNameClass}>{categoryName}</div>
      </Button>
      {categoryIsExpanded && (
        <>
          {shouldDisplayAsMultiSelect ? (
            <MultiSelectFacetsGroup
              messages={messages}
              facets={categoryFacetsToShow}
              aggregationSettings={aggregationSettings}
              onMultiSelectFacetsGroupChange={onCategoryFacetsChange}
              onChange={onChange}
              facetsTextField={facetsTextField}
              showMatchingResults={showMatchingResults}
            />
          ) : (
            <SingleSelectFacetsGroup
              messages={messages}
              facets={categoryFacetsToShow}
              aggregationSettings={aggregationSettings}
              onSingleSelectFacetsGroupChange={onCategoryFacetsChange}
              onChange={onChange}
              selectedFacet={selectedFacet}
              facetsTextField={facetsTextField}
              showMatchingResults={showMatchingResults}
            />
          )}
          {isCollapsible && (
            <>
              <ShowMoreButton
                onClick={showMoreButtonOnClick}
                idSuffix={categoryName}
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
                  onShowMoreModalChange={onCategoryFacetsChange}
                  onChange={onChange}
                  isOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                  shouldDisplayAsMultiSelect={shouldDisplayAsMultiSelect}
                  selectedFacet={selectedFacet}
                  showMatchingResults={showMatchingResults}
                  hasSearchBar={totalNumberFacets > MAX_FACETS_UNTIL_SEARCHBAR}
                  categoryName={categoryName}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
