import React, { FC, useState, useEffect } from 'react';
import { Button } from 'carbon-components-react';
import ChevronDown from '@carbon/icons-react/lib/chevron--down/16';
import ChevronUp from '@carbon/icons-react/lib/chevron--up/16';
import { Messages } from 'components/SearchFacets/messages';
import { MultiSelectFacetsGroup } from './MultiSelectFacetsGroup';
import {
  categoryClass,
  categoryExpandCollapseClass,
  categoryGroupNameClass
} from 'components/SearchFacets/cssClasses';
import {
  InternalQueryTermAggregation,
  SelectableFieldFacetWithCategory
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
  onChange: (selectedFacetField: string, selectedFacetKey: string, checked: boolean) => void;
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

  return (
    <div className={categoryClass}>
      <Button
        className={categoryExpandCollapseClass}
        onClick={() => onClick(categoryName, facetsLabel)}
      >
        <div className={categoryGroupNameClass}>{categoryName}</div>
        {categoryIsExpanded ? <ChevronUp /> : <ChevronDown />}
      </Button>
      {categoryIsExpanded && (
        <MultiSelectFacetsGroup
          facets={categoryFacetsToShow}
          aggregationSettings={aggregationSettings}
          onChange={onChange}
          facetsTextField={facetsTextField}
        />
      )}
      {categoryIsExpanded && isCollapsible && (
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
