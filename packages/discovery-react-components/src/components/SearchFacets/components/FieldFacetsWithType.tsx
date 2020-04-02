import React, { FC, SyntheticEvent, useState } from 'react';
import get from 'lodash/get';
import {
  InternalQueryTermAggregation,
  SearchFilterFacets,
  SelectableQueryTermAggregationResult
} from '../utils/searchFacetInterfaces';
import { Checkbox as CarbonCheckbox, Button } from 'carbon-components-react';
// import ListBox from 'carbon-components-react/lib/components/ListBox';
import ChevronDown from '@carbon/icons-react/lib/chevron--down/16';
// import ChevronUp from '@carbon/icons-react/lib/chevron-up/16';

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
}

export const FieldFacetsWithType: FC<FieldFacetsWithTypeProps> = ({ allFacets, onChange }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  let facetsByType: object = {};
  allFacets.map(facet => {
    const facetLabel = facet.label;
    facetsByType[`${facetLabel}`] = [];
    facet!.results!.map(result => {
      const resultType = result!.aggregations![0].results![0].key;
      if (resultType in facetsByType[`${facetLabel}`]) {
        facetsByType[`${facetLabel}`][`${resultType}`].facets.push({
          key: result.key,
          matching_results: result.matching_results,
          field: facet.field,
          selected: result.selected ? true : false
        });
      } else {
        facetsByType[`${facetLabel}`][`${resultType}`] = {
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
        expandedCategories.filter(category => category !== `${facetLabel}-${category}`)
      );
    } else {
      setExpandedCategories(expandedCategories.concat(`${facetLabel}-${category}`));
    }
  };

  const FacetCategory: FC<FacetCategoryProps> = ({ category, facetLabel }) => {
    return (
      // todo use the prefix here for the className
      // todo make this so that the expansion doesn't also make it check the box...
      <Button
        className={'bx--expand-collapse'}
        onClick={() => handleExpandCollapseOnClick(category, facetLabel)}
      >
        {/* todo: chevron icon direction also needs to change to up when this is clicked */}
        {category} <ChevronDown />
        {/* <ListBox.Selection selectionCount={1} />  */}
      </Button>
    );
  };

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

  const handleCategoryOnChange = (
    checked: boolean,
    _id: string,
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    const target: HTMLInputElement = event.currentTarget;
    const facetLabel = target.getAttribute('data-label' || '');
    const facetField = target.getAttribute('data-field' || '');
    const facetCategory = target.getAttribute('data-category' || '');
    const facetsForNameIndex = allFacets.findIndex(allFacet => {
      return allFacet.field === facetField;
    });

    if (facetsForNameIndex > -1) {
      const facetsForName = allFacets[facetsForNameIndex];
      const facetResults: SelectableQueryTermAggregationResult[] = get(
        facetsForName,
        'results',
        []
      );
      let selectedFacetResults: SelectableQueryTermAggregationResult[] = facetResults;
      facetsByType[facetLabel!][facetCategory].facets.map((facet: any) => {
        const selectedFacetIndex = selectedFacetResults.findIndex(selectedFacet => {
          return selectedFacet.key === facet.key;
        });
        if (selectedFacetIndex > -1) {
          selectedFacetResults[selectedFacetIndex].selected = checked;
        }
      });
      allFacets[facetsForNameIndex].results = selectedFacetResults;
    }
    onChange({ filterFields: allFacets });
  };

  return (
    <div>
      {Object.entries(facetsByType).map(entry => {
        return (
          <div>
            <fieldset className="bx--fieldset">
              <legend className="bx--label">{entry[0]}</legend>
              {Object.entries(entry[1]).map((entity: any) => {
                const categoryAllSelected =
                  entity[1].facets.filter((facet: any) => facet.selected).length ===
                  entity[1].facets.length;
                return (
                  <>
                    <CarbonCheckbox
                      labelText={<FacetCategory category={entity[0]} facetLabel={entry[0]} />}
                      id={`${entry[0]}-${entity[1]}`}
                      key={`${entry[0]}-${entity[1]}`}
                      checked={categoryAllSelected}
                      data-field={entity[1].facets[0].field}
                      data-category={entity[0]}
                      data-label={entry[0]}
                      onChange={handleCategoryOnChange}
                    />
                    {expandedCategories.includes(`${entry[0]}-${entity[0]}`) ? (
                      entity[1].facets.map((facet: any) => {
                        // TODO: Improve id/key here
                        const buff = new Buffer(facet.field + facet.key);
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
                      })
                    ) : (
                      <div></div>
                    )}
                  </>
                );
              })}
            </fieldset>
          </div>
        );
      })}
    </div>
  );
};
