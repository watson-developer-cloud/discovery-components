import React, { FC, SyntheticEvent, useState } from 'react';
import get from 'lodash/get';
import {
  InternalQueryTermAggregation,
  SearchFilterFacets,
  SelectableQueryTermAggregationResult
} from '../utils/searchFacetInterfaces';
import { Checkbox as CarbonCheckbox, Button } from 'carbon-components-react';
import ListBox from 'carbon-components-react/lib/components/ListBox';
import ChevronDown from '@carbon/icons-react/lib/chevron--down/16';
import ChevronUp from '@carbon/icons-react/lib/chevron--up/16';
import { labelAndSelectionContainerClass, fieldsetClasses, labelClasses } from '../cssClasses';

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

interface FacetCategoryProps {
  category: string;
  facetLabel: string;
  expanded: boolean;
}

interface FacetCategoryGroupProps {
  categoryFacets: any;
  onChange: any;
  expanded: boolean;
  allFacets: InternalQueryTermAggregation[];
}

const FacetCategoryGroup: FC<FacetCategoryGroupProps> = ({
  allFacets,
  categoryFacets,
  onChange,
  expanded
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const toggleFacetsCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const categoryFacetsToShow = isCollapsed ? categoryFacets.slice(0, 4) : categoryFacets;

  const handleOnChange = (
    checked: boolean,
    _id: string,
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    const target: HTMLInputElement = event.currentTarget;
    const selectedFacetName = target.getAttribute('data-name') || '';
    const selectedFacetField = target.getAttribute('data-field') || '';
    const facetsForNameIndex = allFacets.findIndex(facet => {
      return facet.field === selectedFacetField;
    });

    if (facetsForNameIndex > -1) {
      const facetsForName = allFacets[facetsForNameIndex];
      const facetResults: SelectableQueryTermAggregationResult[] = get(
        facetsForName,
        'results',
        []
      );
      const selectedFacetResults: SelectableQueryTermAggregationResult[] = facetResults.map(
        result => {
          const key = get(result, 'key', '');

          return key === selectedFacetName
            ? Object.assign({}, result, { selected: checked })
            : result;
        }
      );
      allFacets[facetsForNameIndex].results = selectedFacetResults;
    }

    onChange({ filterFields: allFacets });
  };

  if (expanded) {
    return (
      // todo; add styling of padding-left 1rem to this
      <div className={'bx--category-wrapper'}>
        {categoryFacetsToShow.map((facet: any) => {
          const buff = new Buffer(facet.field.replace(/\s+/g, '_') + facet.key);
          const base64data = buff.toString('base64');
          return (
            <CarbonCheckbox
              labelText={`${facet.key} (${facet.matching_results})`}
              id={base64data}
              key={base64data}
              data-name={facet.key}
              data-field={facet.field}
              onChange={handleOnChange}
              checked={facet.selected}
            />
          );
        })}
        <Button kind="ghost" size="small" onClick={toggleFacetsCollapse}>
          {isCollapsed ? 'Show more' : 'Show less'}
        </Button>
      </div>
    );
  } else {
    return <div></div>;
  }
};

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

  const FacetCategory: FC<FacetCategoryProps> = ({ category, facetLabel, expanded }) => {
    return (
      // todo use the prefix here for the className
      <Button
        className={'bx--expand-collapse'}
        onClick={() => handleExpandCollapseOnClick(category, facetLabel)}
      >
        {/* todo: chevron icon direction also needs to change to up when this is clicked */}
        {category}
        {expanded ? <ChevronDown /> : <ChevronUp />}
      </Button>
    );
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
                    <FacetCategory category={entity[0]} facetLabel={entry[0]} expanded={expanded} />
                    {/* todo: update to have the expansion check here to only show fcg component in this case */}
                    <FacetCategoryGroup
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
