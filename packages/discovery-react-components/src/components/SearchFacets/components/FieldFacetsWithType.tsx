import React, { FC, useState } from 'react';
import { Button } from 'carbon-components-react';
import ListBox from 'carbon-components-react/lib/components/ListBox';
import ChevronDown from '@carbon/icons-react/lib/chevron--down/16';
import ChevronUp from '@carbon/icons-react/lib/chevron--up/16';
import {
  InternalQueryTermAggregation,
  SearchFilterFacets,
  SelectableQueryTermAggregationResult
} from '../utils/searchFacetInterfaces';
import { labelAndSelectionContainerClass, fieldsetClasses, labelClasses } from '../cssClasses';
import { FieldFacetsCategoryGroup } from './FieldFacetsCategoryGroup';

interface FieldFacetsWithTypeProps {
  /**
   * Facets configuration with fields and results counts
   */
  allFacets: InternalQueryTermAggregation[];
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (updatedFacet: Partial<SearchFilterFacets>) => void;
}

export const FieldFacetsWithType: FC<FieldFacetsWithTypeProps> = ({ allFacets, onChange }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  let facetsByType: object = {};
  allFacets.map(facet => {
    const facetLabel = facet.label;
    facetsByType[`${facetLabel}`] = { facetName: facet.name, categories: [] };
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
      const newArr = [...expandedCategories];
      newArr.splice(indexOfCategory, 1);
      setExpandedCategories(newArr);
    } else {
      setExpandedCategories(expandedCategories.concat(`${facetLabel}-${category}`));
    }
  };

  // TODO: figure out way to not duplicate this with FieldFacets component
  const handleOnClear = (selectedFacetName: string) => {
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

  return (
    <div>
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
          <div>
            <fieldset className={fieldsetClasses.join(' ')}>
              <legend className={labelClasses.join(' ')}>
                <div className={labelAndSelectionContainerClass}>
                  {facetLabel}
                  <ListBox.Selection
                    clearSelection={() => handleOnClear(entry[1].facetName)}
                    selectionCount={selectedValuesCount}
                  />
                </div>
              </legend>
              {Object.entries(entry[1].categories).map((entity: any) => {
                const categoryName = entity[0];
                const isCategoryExpanded = expandedCategories.includes(
                  `${facetLabel}-${categoryName}`
                );
                return (
                  <div className={'bx--search-facet--category'}>
                    <Button
                      className={'bx--search-facet--category--expand-collapse'}
                      onClick={() => handleExpandCollapseOnClick(categoryName, facetLabel)}
                    >
                      <div className={'bx--search-facet--category--category-name'}>
                        {categoryName}
                      </div>
                      {isCategoryExpanded ? <ChevronDown /> : <ChevronUp />}
                    </Button>
                    {isCategoryExpanded && (
                      <FieldFacetsCategoryGroup
                        allFacets={allFacets}
                        categoryFacets={entity[1].facets}
                        onChange={onChange}
                      />
                    )}
                  </div>
                );
              })}
            </fieldset>
          </div>
        );
      })}
    </div>
  );
};
