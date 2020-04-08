import React, { FC, useState, useEffect, useContext } from 'react';
import {
  InternalQueryTermAggregation,
  FieldFacetsByCategory
} from 'components/SearchFacets/utils/searchFacetInterfaces';
import { Messages } from 'components/SearchFacets/messages';
import { CategoryFacets } from './CategoryFacets';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';

interface CategoryFacetsGroupProps {
  /**
   * Facets with categories ordered by category
   */
  facetsByCategory: FieldFacetsByCategory;
  /**
   * Label for the facet
   */
  facetsLabel: string;
  /**
   * Facet text field
   */
  facetsTextField: 'key' | 'text';
  /**
   * Aggregation component settings
   */
  aggregationSettings: InternalQueryTermAggregation;
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (selectedFacetField: string, selectedFacetKey: string, checked: boolean) => void;
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * How many facets should be shown
   */
  collapsedFacetsCount: number;
}

export const CategoryFacetsGroup: FC<CategoryFacetsGroupProps> = ({
  facetsByCategory,
  facetsLabel,
  aggregationSettings,
  onChange,
  messages,
  collapsedFacetsCount,
  facetsTextField
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const {
    searchResponseStore: {
      parameters: { naturalLanguageQuery }
    }
  } = useContext(SearchContext);

  useEffect(() => {
    setExpandedCategories([]);
  }, [naturalLanguageQuery]);

  const handleExpandCollapseOnClick = (category: string, facetsLabel: string) => {
    const indexOfCategory = expandedCategories.indexOf(`${facetsLabel}-${category}`);
    if (indexOfCategory > -1) {
      const expandedCategoriesCopy = [...expandedCategories];
      expandedCategoriesCopy.splice(indexOfCategory, 1);
      setExpandedCategories(expandedCategoriesCopy);
    } else {
      setExpandedCategories(expandedCategories.concat(`${facetsLabel}-${category}`));
    }
  };

  return (
    <>
      {Object.entries(facetsByCategory[`${facetsLabel}`].categories).map((entity: any) => {
        const categoryName = entity[0];
        const categoryIsExpanded = expandedCategories.includes(`${facetsLabel}-${categoryName}`);
        return (
          <CategoryFacets
            categoryName={categoryName}
            facetsLabel={facetsLabel}
            facets={entity[1].facets}
            onChange={onChange}
            messages={messages}
            aggregationSettings={aggregationSettings}
            categoryIsExpanded={categoryIsExpanded}
            collapsedFacetsCount={collapsedFacetsCount}
            onClick={handleExpandCollapseOnClick}
            facetsTextField={facetsTextField}
          />
        );
      })}
    </>
  );
};
