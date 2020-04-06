import React, { FC, useState } from 'react';
import { Button } from 'carbon-components-react';
import ListBox from 'carbon-components-react/lib/components/ListBox';
import ChevronDown from '@carbon/icons-react/lib/chevron--down/16';
import ChevronUp from '@carbon/icons-react/lib/chevron--up/16';
import {
  InternalQueryTermAggregation,
  SearchFilterFacets,
  SelectableQueryTermAggregationResult,
  FieldFacetsByType
} from '../utils/searchFacetInterfaces';
import { Messages } from '../messages';
import {
  labelAndSelectionContainerClass,
  fieldsetClasses,
  labelClasses,
  categoryClass,
  categoryExpandCollapseClass,
  categoryGroupNameClass
} from '../cssClasses';
import { FieldFacetsWithCategoryGroup } from './FacetsGroups/FieldFacetsWithCategoryGroup';

interface FieldFacetsWithCategoryProps {
  /**
   * Facets configuration with fields and results counts
   */
  allFacets: InternalQueryTermAggregation[];
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (updatedFacet: Partial<SearchFilterFacets>) => void;
  /**
   * Number of facet terms to show when list is collapsed
   */
  collapsedFacetsCount: number;
  /**
   * i18n messages for the component
   */
  messages: Messages;
}

export const FieldFacetsWithCategory: FC<FieldFacetsWithCategoryProps> = ({
  allFacets,
  onChange,
  collapsedFacetsCount,
  messages
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  let facetsByType: FieldFacetsByType = {};
  allFacets.map(facet => {
    const facetLabel = facet.label;
    facetsByType[`${facetLabel}`] = { facetName: facet.name, categories: {} };
    facet!.results!.map(result => {
      const resultType = result!.aggregations![0].results![0].key;
      if (resultType in facetsByType[`${facetLabel}`].categories) {
        facetsByType[`${facetLabel}`].categories[`${resultType}`].facets.push({
          key: result.key,
          matching_results: result.matching_results,
          field: facet.field,
          selected: result.selected ? true : false
        });
      } else {
        facetsByType[`${facetLabel}`].categories[`${resultType}`] = {
          facets: [
            {
              key: result.key,
              matching_results: result.matching_results,
              field: facet.field,
              selected: result.selected ? result.selected : false
            }
          ]
        };
      }
    });
  });

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

  const handleOnClear = (selectedFacetName?: string) => {
    const facetsForNameIndex = allFacets.findIndex(facet => {
      if (!facet.name) {
        return facet.field === selectedFacetName;
      }
      return facet.name === selectedFacetName;
    });
    if (facetsForNameIndex > -1) {
      const results = allFacets[facetsForNameIndex].results || [];
      const deselectedResults = (results as SelectableQueryTermAggregationResult[]).map(result => {
        return { ...result, selected: false };
      });
      allFacets[facetsForNameIndex].results = deselectedResults;
      onChange({ filterFields: allFacets });
    }
  };

  const translateWithId = (id: string): string => {
    const mapping = {
      'clear.all': messages.clearFacetTitle,
      'clear.selection': messages.clearFacetSelectionTitle
    };
    return mapping[id];
  };

  return (
    <>
      {Object.entries(facetsByType).map(entry => {
        const facetLabel = entry[0];
        let selectedValuesCount = 0;
        Object.entries(entry[1].categories).map((entity: any) => {
          entity[1].facets.map((facet: any) => {
            if (facet.selected) {
              selectedValuesCount += 1;
            }
          });
        });
        return (
          <>
            <fieldset className={fieldsetClasses.join(' ')}>
              <legend className={labelClasses.join(' ')}>
                <div className={labelAndSelectionContainerClass}>
                  {facetLabel}
                  {selectedValuesCount > 0 && (
                    <ListBox.Selection
                      clearSelection={() => handleOnClear(entry[1].facetName)}
                      selectionCount={selectedValuesCount}
                      translateWithId={translateWithId}
                    />
                  )}
                </div>
              </legend>
              {Object.entries(entry[1].categories).map((entity: any) => {
                const categoryName = entity[0];
                const isCategoryExpanded = expandedCategories.includes(
                  `${facetLabel}-${categoryName}`
                );
                return (
                  <div className={categoryClass}>
                    <Button
                      className={categoryExpandCollapseClass}
                      onClick={() => handleExpandCollapseOnClick(categoryName, facetLabel)}
                    >
                      <div className={categoryGroupNameClass}>{categoryName}</div>
                      {isCategoryExpanded ? <ChevronDown /> : <ChevronUp />}
                    </Button>
                    {isCategoryExpanded && (
                      <FieldFacetsWithCategoryGroup
                        allFacets={allFacets}
                        categoryFacets={entity[1].facets}
                        onChange={onChange}
                        messages={messages}
                        collapsedFacetsCount={collapsedFacetsCount}
                      />
                    )}
                  </div>
                );
              })}
            </fieldset>
          </>
        );
      })}
    </>
  );
};
