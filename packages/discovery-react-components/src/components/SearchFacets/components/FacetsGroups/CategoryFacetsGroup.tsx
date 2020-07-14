import React, { FC, useState, useEffect, useContext, SyntheticEvent } from 'react';
import {
  InternalQueryTermAggregation,
  FieldFacetsByCategory,
  FieldFacetsByCategoryEntity,
  SelectedFacet
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
  onCategoryFacetsGroupChange: (selectedFacets: SelectedFacet[]) => void;
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * How many facets should be shown
   */
  collapsedFacetsCount: number;
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

export const CategoryFacetsGroup: FC<CategoryFacetsGroupProps> = ({
  facetsByCategory,
  facetsLabel,
  aggregationSettings,
  onCategoryFacetsGroupChange,
  messages,
  collapsedFacetsCount,
  facetsTextField,
  shouldDisplayAsMultiSelect,
  selectedFacet,
  showMatchingResults,
  onChange
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
      {Object.entries(facetsByCategory[`${facetsLabel}`].categories).map(
        (entity: FieldFacetsByCategoryEntity) => {
          const categoryName = entity[0];
          const categoryIsExpanded = expandedCategories.includes(`${facetsLabel}-${categoryName}`);
          return (
            <CategoryFacets
              categoryName={categoryName}
              facetsLabel={facetsLabel}
              facets={entity[1].facets}
              onCategoryFacetsChange={onCategoryFacetsGroupChange}
              onChange={onChange}
              messages={messages}
              aggregationSettings={aggregationSettings}
              categoryIsExpanded={categoryIsExpanded}
              collapsedFacetsCount={collapsedFacetsCount}
              onClick={handleExpandCollapseOnClick}
              facetsTextField={facetsTextField}
              shouldDisplayAsMultiSelect={shouldDisplayAsMultiSelect}
              selectedFacet={selectedFacet}
              showMatchingResults={showMatchingResults}
              key={facetsLabel + categoryName}
            />
          );
        }
      )}
    </>
  );
};
