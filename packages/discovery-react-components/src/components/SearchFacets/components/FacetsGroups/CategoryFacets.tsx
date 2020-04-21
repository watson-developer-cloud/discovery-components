import React, { FC, useState, useEffect } from 'react';
import { Button } from 'carbon-components-react';
import ChevronDown from '@carbon/icons-react/lib/chevron--down/16';
import ChevronUp from '@carbon/icons-react/lib/chevron--up/16';
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
  onChange: (selectedFacets: SelectedFacet[]) => void;
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
}

export const CategoryFacets: FC<CategoryFacetsProps> = ({
  categoryName,
  facetsLabel,
  facets,
  facetsTextField,
  onChange,
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

  const categoryFacetsToShow = isCollapsed ? facets.slice(0, collapsedFacetsCount - 1) : facets;
  const iconToRender = categoryIsExpanded ? ChevronUp : ChevronDown;
  const totalNumberFacets = facets.length;
  const showMoreButtonOnClick = totalNumberFacets <= 10 ? toggleFacetsCollapse : setModalOpen;

  return (
    <div className={categoryClass}>
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
              onChange={onChange}
              facetsTextField={facetsTextField}
              showMatchingResults={showMatchingResults}
            />
          ) : (
            <SingleSelectFacetsGroup
              messages={messages}
              facets={categoryFacetsToShow}
              aggregationSettings={aggregationSettings}
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
                messages={messages}
              />
              {totalNumberFacets > 10 && (
                <ShowMoreModal
                  messages={messages}
                  aggregationSettings={aggregationSettings}
                  facets={facets}
                  facetsLabel={facetsLabel}
                  facetsTextField={facetsTextField}
                  onChange={onChange}
                  isOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                  shouldDisplayAsMultiSelect={shouldDisplayAsMultiSelect}
                  selectedFacet={selectedFacet}
                  showMatchingResults={showMatchingResults}
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
