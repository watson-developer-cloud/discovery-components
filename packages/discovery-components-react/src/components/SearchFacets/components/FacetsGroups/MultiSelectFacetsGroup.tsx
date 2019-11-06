import React, { FC, useContext, SyntheticEvent } from 'react';
import { optionClass, optionLabelClass } from './facetGroupClasses';
import { Checkbox as CarbonCheckbox } from 'carbon-components-react';
import { SearchContext } from '../../../DiscoverySearch/DiscoverySearch';
import {
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult,
  AggregationSettings
} from '../../utils/searchFacetInterfaces';
import get from 'lodash/get';

interface MultiSelectFacetsGroupProps {
  /**
   * Dynamic facets text and selected flag
   */
  facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[];
  /**
   * Facet text field
   */
  facetsTextField: 'key' | 'text';
  /**
   * Aggregation component settings
   */
  aggregationSettings: AggregationSettings;
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (selectedFacetField: string, selectedFacetKey: string, checked: boolean) => void;
}

export const MultiSelectFacetsGroup: FC<MultiSelectFacetsGroupProps> = ({
  facets,
  facetsTextField,
  aggregationSettings,
  onChange
}) => {
  const {
    searchParameters: { naturalLanguageQuery }
  } = useContext(SearchContext);
  const facetsLabel = aggregationSettings.label || aggregationSettings.field;
  const escapedLabel = facetsLabel.replace(/\s+/g, '_');

  const handleOnChange = (
    checked: boolean,
    _id: string,
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    const target: HTMLInputElement = event.currentTarget;
    const selectedFacetField = target.getAttribute('data-field') || '';
    const selectedFacetKey = target.getAttribute('data-key') || '';
    onChange(selectedFacetField, selectedFacetKey, checked);
  };

  return (
    <>
      {facets.map(facet => {
        const text = get(facet, facetsTextField, '');
        const query = naturalLanguageQuery || '';
        const buff = new Buffer(query + text);
        const base64data = buff.toString('base64');

        return (
          <CarbonCheckbox
            className={optionLabelClass}
            wrapperClassName={optionClass}
            onChange={handleOnChange}
            labelText={text}
            key={`checkbox-${escapedLabel}-${base64data}`}
            id={`checkbox-${escapedLabel}-${text.replace(/\s+/g, '_')}`}
            data-field={aggregationSettings.field}
            data-key={text}
            checked={!!facet.selected}
          />
        );
      })}
    </>
  );
};
