import React, { FC, SyntheticEvent } from 'react';
import get from 'lodash/get';
import {
  InternalQueryTermAggregation,
  SearchFilterFacets,
  SelectableQueryTermAggregationResult
} from '../utils/searchFacetInterfaces';
import { Checkbox as CarbonCheckbox } from 'carbon-components-react';
import ListBox from 'carbon-components-react/lib/components/ListBox';
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
  label: string;
}

const FacetCategory: FC<FacetCategoryProps> = ({ label }) => {
  return (
    <div>
      {label} <ListBox.Selection selectionCount={1} /> <ChevronDown />
    </div>
  );
};

export const FieldFacetsWithType: FC<FieldFacetsWithTypeProps> = ({ allFacets, onChange }) => {
  let facetsByType: object = {};
  allFacets.map(facet => {
    const facetLabel = facet.label;
    facetsByType[`${facetLabel}`] = [];
    facet!.results!.map(result => {
      const resultType = result!.aggregations![0].results![0].key;
      if (resultType in facetsByType[`${facetLabel}`]) {
        facetsByType[`${facetLabel}`][`${resultType}`].push({
          key: result.key,
          matching_results: result.matching_results,
          field: facet.field
        });
      } else {
        facetsByType[`${facetLabel}`][`${resultType}`] = [
          { key: result.key, matching_results: result.matching_results, field: facet.field }
        ];
      }
    });
  });

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

  return (
    <div>
      {Object.entries(facetsByType).map(entry => {
        return (
          <div>
            <fieldset className="bx--fieldset">
              <legend className="bx--label">{entry[0]}</legend>
              {Object.entries(entry[1]).map((entity: any) => {
                return (
                  <>
                    <CarbonCheckbox
                      labelText={<FacetCategory label={entity[0]} />}
                      id={entity[0]}
                    />
                    {entity[1].map((facet: any) => {
                      return (
                        <CarbonCheckbox
                          labelText={`${facet.key} (${facet.matching_results})`}
                          id={facet.key}
                          data-name={facet.key}
                          data-field={facet.field}
                          onChange={handleOnChange}
                        />
                      );
                    })}
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
