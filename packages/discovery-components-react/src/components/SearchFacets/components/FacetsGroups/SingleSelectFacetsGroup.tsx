import React, { FC, useContext, SyntheticEvent } from 'react';
import {
  RadioButtonGroup as CarbonRadioButtonGroup,
  RadioButton as CarbonRadioButton
} from 'carbon-components-react';
import { SearchContext } from '../../../DiscoverySearch/DiscoverySearch';
import { optionLabelClass, singleSelectGroupClass } from './facetGroupClasses';
import {
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult,
  AggregationSettings
} from '../../utils/searchFacetInterfaces';
import get from 'lodash/get';

interface SingleSelectFacetsGroupProps {
  /**
   * Facets text and selected flag
   */
  facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[];
  /**
   * Aggregation component settings
   */
  aggregationSettings: AggregationSettings;
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
  onChange: (selectedFacetField: string, selectedFacetKey: string, checked: boolean) => void;
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
  const facetsLabel = aggregationSettings.label || aggregationSettings.field;
  const escapedLabel = facetsLabel.replace(/\s+/g, '_');

  const handleOnClick = (event: SyntheticEvent<HTMLInputElement>): void => {
    const target: HTMLInputElement = event.currentTarget;
    const field = target.getAttribute('name') || '';
    const text = target.getAttribute('value') || '';
    onChange(field, text, true);
  };

  return (
    <CarbonRadioButtonGroup
      name={aggregationSettings.field}
      valueSelected={selectedFacet}
      orientation={'vertical'}
      className={singleSelectGroupClass}
    >
      {facets.map(facet => {
        const text = get(facet, facetsTextField, '');
        const query = naturalLanguageQuery || '';
        const buff = new Buffer(query + text);
        const base64data = buff.toString('base64');

        return (
          <CarbonRadioButton
            className={optionLabelClass}
            labelText={text}
            key={`checkbox-${escapedLabel}-${base64data}`}
            id={`checkbox-${escapedLabel}-${text.replace(/\s+/g, '_')}`}
            value={text}
            onClick={handleOnClick}
          />
        );
      })}
    </CarbonRadioButtonGroup>
  );
};
