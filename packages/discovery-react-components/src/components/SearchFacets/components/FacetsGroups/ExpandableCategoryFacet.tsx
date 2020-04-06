import React, { FC, useState } from 'react';
import { InternalQueryTermAggregation } from 'components/SearchFacets/utils/searchFacetInterfaces';
import { Messages } from 'components/SearchFacets/messages';
import { CategoryFacet } from './CategoryFacet';

interface ExpandableCategoryFacetProps {
  facetsByType: object;
  facetLabel: string;
  aggregationSettings: InternalQueryTermAggregation;
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (selectedFacetField: string, selectedFacetKey: string, checked: boolean) => void;
  messages: Messages;
}

export const ExpandableCategoryFacet: FC<ExpandableCategoryFacetProps> = ({
  facetsByType,
  facetLabel,
  aggregationSettings,
  onChange,
  messages
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const handleExpandCollapseOnClick = (category: string, facetLabel: string) => {
    const indexOfCategory = expandedCategories.indexOf(`${facetLabel}-${category}`);
    if (indexOfCategory > -1) {
      const expandedCategoriesCopy = [...expandedCategories];
      expandedCategoriesCopy.splice(indexOfCategory, 1);
      setExpandedCategories(expandedCategoriesCopy);
    } else {
      setExpandedCategories(expandedCategories.concat(`${facetLabel}-${category}`));
    }
  };

  return (
    <>
      {Object.entries(facetsByType[`${facetLabel}`].categories).map((entity: any) => {
        const categoryName = entity[0];
        const isCategoryExpanded = expandedCategories.includes(`${facetLabel}-${categoryName}`);
        return (
          <CategoryFacet
            categoryName={categoryName}
            facetLabel={facetLabel}
            facets={entity[1].facets}
            onChange={onChange}
            messages={messages}
            aggregationSettings={aggregationSettings}
            isCategoryExpanded={isCategoryExpanded}
            collapsedFacetsCount={5}
            onClick={handleExpandCollapseOnClick}
          />
        );
      })}
    </>
  );
};
