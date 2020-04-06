import React, { FC, useState, useEffect } from 'react';
import { Messages } from '../../messages';
import { Button } from 'carbon-components-react';
import { MultiSelectFacetsGroup } from './MultiSelectFacetsGroup';
import {
  categoryClass,
  categoryExpandCollapseClass,
  categoryGroupNameClass
} from '../../cssClasses';
import ChevronDown from '@carbon/icons-react/lib/chevron--down/16';
import ChevronUp from '@carbon/icons-react/lib/chevron--up/16';
import { InternalQueryTermAggregation } from 'components/SearchFacets/utils/searchFacetInterfaces';

interface CategoryFacetProps {
  categoryName: string;
  facetLabel: string;
  facets: any;
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (selectedFacetField: string, selectedFacetKey: string, checked: boolean) => void;
  messages: Messages;
  isCategoryExpanded: boolean;
  collapsedFacetsCount: number;
  onClick: any;
  aggregationSettings: InternalQueryTermAggregation;
}

export const CategoryFacet: FC<CategoryFacetProps> = ({
  categoryName,
  facetLabel,
  facets,
  onChange,
  messages,
  isCategoryExpanded,
  collapsedFacetsCount,
  onClick,
  aggregationSettings
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [isCollapsible, setIsCollapsible] = useState<boolean>(collapsedFacetsCount < facets.length);

  useEffect(() => {
    setIsCollapsed(collapsedFacetsCount < facets.length);
    setIsCollapsible(collapsedFacetsCount < facets.length);
  }, [collapsedFacetsCount, facets.length]);

  const toggleFacetsCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const categoryFacetsToShow = isCollapsed ? facets.slice(0, collapsedFacetsCount - 1) : facets;

  const handleOnClick = (categoryName: string, facetLabel: string) => {
    onClick(categoryName, facetLabel);
  };

  return (
    <div className={categoryClass}>
      <Button
        className={categoryExpandCollapseClass}
        onClick={() => handleOnClick(categoryName, facetLabel)}
      >
        <div className={categoryGroupNameClass}>{categoryName}</div>
        {isCategoryExpanded ? <ChevronDown /> : <ChevronUp />}
      </Button>
      {isCategoryExpanded && (
        <MultiSelectFacetsGroup
          facets={categoryFacetsToShow}
          aggregationSettings={aggregationSettings}
          onChange={onChange}
          facetsTextField={'key'}
        />
      )}
      {isCategoryExpanded && isCollapsible && (
        <Button
          kind="ghost"
          size="small"
          onClick={toggleFacetsCollapse}
          data-testid={`show-more-less-${categoryName}`}
        >
          {isCollapsed ? messages.collapsedFacetShowMoreText : messages.collapsedFacetShowLessText}
        </Button>
      )}
    </div>
  );
};
