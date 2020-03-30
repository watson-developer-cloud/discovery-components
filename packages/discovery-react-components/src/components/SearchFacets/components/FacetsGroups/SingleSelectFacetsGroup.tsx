import React, { FC, useContext, SyntheticEvent } from 'react';
import {
  RadioButtonGroup as CarbonRadioButtonGroup,
  RadioButton as CarbonRadioButton
} from 'carbon-components-react';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import { optionLabelClass, singleSelectGroupClass } from 'components/SearchFacets/cssClasses';
import {
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult,
  InternalQueryTermAggregation
} from 'components/SearchFacets/utils/searchFacetInterfaces';
import get from 'lodash/get';

interface SingleSelectFacetsGroupProps {
  /**
   * Facets text and selected flag
   */
  facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[];
  /**
   * Aggregation component settings
   */
  aggregationSettings: InternalQueryTermAggregation;
  /**
   * Facet text field
   */
  facetsTextField: 'key' | 'text';
  /**
   * Text of selected facet
   */
  selectedFacet: string;
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (selectedFacetName: string, selectedFacetKey: string, checked: boolean) => void;
}

export const SingleSelectFacetsGroup: FC<SingleSelectFacetsGroupProps> = ({
  facets,
  facetsTextField,
  selectedFacet,
  aggregationSettings,
  onChange
}) => {
  const {
    searchResponseStore: {
      parameters: { naturalLanguageQuery }
    }
  } = useContext(SearchContext);
  const escapedName = (aggregationSettings.name || aggregationSettings.field).replace(/\s+/g, '_');

  const handleOnClick = (event: SyntheticEvent<HTMLInputElement>): void => {
    const target: HTMLInputElement = event.currentTarget;
    const name = target.getAttribute('name') || '';
    const text = target.getAttribute('value') || '';
    onChange(name, text, true);
  };

  return (
    <CarbonRadioButtonGroup
      name={aggregationSettings.name || aggregationSettings.field}
      valueSelected={selectedFacet}
      orientation={'vertical'}
      className={singleSelectGroupClass}
    >
      {facets.map(facet => {
        const text = get(facet, facetsTextField, '');
        const matchingResults = facet.matching_results;
        const labelText =
          matchingResults !== undefined ? text + ' (' + matchingResults + ')' : text;
        const query = naturalLanguageQuery || '';
        const buff = new Buffer(query + text);
        const base64data = buff.toString('base64');

        return (
          <CarbonRadioButton
            className={optionLabelClass}
            labelText={labelText}
            key={`checkbox-${escapedName}-${base64data}`}
            id={`checkbox-${escapedName}-${text.replace(/\s+/g, '_')}`}
            value={text}
            onClick={handleOnClick}
          />
        );
      })}
    </CarbonRadioButtonGroup>
  );
};
