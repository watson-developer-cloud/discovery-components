import React, { FC, useContext, SyntheticEvent } from 'react';
import { optionClass, optionLabelClass } from '../../cssClasses';
import { Messages } from 'components/SearchFacets/messages';
import { formatMessage } from 'utils/formatMessage';
import { Checkbox as CarbonCheckbox } from 'carbon-components-react';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import {
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult,
  InternalQueryTermAggregation
} from 'components/SearchFacets/utils/searchFacetInterfaces';
import get from 'lodash/get';

interface MultiSelectFacetsGroupProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
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
  aggregationSettings: InternalQueryTermAggregation;
  /**
   * Show matching documents count as part of label
   */
  showMatchingResults: boolean;
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (selectedFacetField: string, selectedFacetKey: string, checked: boolean) => void;
}

export const MultiSelectFacetsGroup: FC<MultiSelectFacetsGroupProps> = ({
  messages,
  facets,
  facetsTextField,
  aggregationSettings,
  showMatchingResults,
  onChange
}) => {
  const {
    searchResponseStore: {
      parameters: { naturalLanguageQuery }
    }
  } = useContext(SearchContext);
  const escapedName = (aggregationSettings.name || aggregationSettings.field).replace(/\s+/g, '_');

  const handleOnChange = (
    checked: boolean,
    _id: string,
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    const target: HTMLInputElement = event.currentTarget;
    const selectedFacetName = target.getAttribute('data-name') || '';
    const selectedFacetKey = target.getAttribute('data-key') || '';
    onChange(selectedFacetName, selectedFacetKey, checked);
  };

  const getLabel = (facetText: string, count: number | undefined) => {
    return count !== undefined && showMatchingResults
      ? formatMessage(messages.labelTextWithCount, { facetText: facetText, count: count }, false)
      : formatMessage(messages.labelText, { facetText: facetText }, false);
  };

  return (
    <>
      {facets.map(facet => {
        const facetText = get(facet, facetsTextField, '');
        const count = facet.matching_results;
        const labelText = getLabel(facetText, count);
        const query = naturalLanguageQuery || '';
        const buff = new Buffer(query + facetText);
        const base64data = buff.toString('base64');

        return (
          <CarbonCheckbox
            className={optionLabelClass}
            wrapperClassName={optionClass}
            onChange={handleOnChange}
            labelText={labelText}
            key={`checkbox-${escapedName}-${base64data}`}
            id={`checkbox-${escapedName}-${facetText.replace(/\s+/g, '_')}`}
            data-name={aggregationSettings.name || aggregationSettings.field}
            data-key={facetText}
            checked={!!facet.selected}
          />
        );
      })}
    </>
  );
};
