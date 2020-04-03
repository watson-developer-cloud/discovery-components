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
    if (expandedCategories.includes(`${facetLabel}-${category}`)) {
      setExpandedCategories(
        expandedCategories.filter(category => category === `${facetLabel}-${category}`)
      );
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
                  {entry[0]}
                  <ListBox.Selection
                    clearSelection={() => handleOnClear(entry[1].facetName)}
                    selectionCount={selectedValuesCount}
                  />
                </div>
              </legend>
              {Object.entries(entry[1].categories).map((entity: any) => {
                const expanded = expandedCategories.includes(`${entry[0]}-${entity[0]}`);
                return (
                  <div>
                    <Button
                      className={'bx--expand-collapse'}
                      onClick={() => handleExpandCollapseOnClick(entity[0], entry[0])}
                    >
                      {entity[0]}
                      {expanded ? <ChevronDown /> : <ChevronUp />}
                    </Button>
                    {/* todo: update to have the expansion check here to only show fcg component in this case */}
                    <FieldFacetsCategoryGroup
                      allFacets={allFacets}
                      categoryFacets={entity[1].facets}
                      onChange={onChange}
                      expanded={expanded}
                    />
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
