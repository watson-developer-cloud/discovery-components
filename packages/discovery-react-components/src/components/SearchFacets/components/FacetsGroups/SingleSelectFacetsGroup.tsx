import React, { FC, useContext, SyntheticEvent } from 'react';
import {
  RadioButtonGroup as CarbonRadioButtonGroup,
  RadioButton as CarbonRadioButton
} from 'carbon-components-react';
import { Buffer } from 'buffer';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import { Messages } from 'components/SearchFacets/messages';
import { getFacetLabel } from 'components/SearchFacets/utils/getFacetLabel';
import { optionLabelClass, singleSelectGroupClass } from 'components/SearchFacets/cssClasses';
import {
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult,
  InternalQueryTermAggregation,
  SelectedFacet
} from 'components/SearchFacets/utils/searchFacetInterfaces';
import get from 'lodash/get';

interface SingleSelectFacetsGroupProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
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
   * Show matching documents count as part of label
   */
  showMatchingResults: boolean;
  /**
   * Text of selected facet
   */
  selectedFacet: string;
  /**
   * Callback to handle changes in selected facets
   */
  onSingleSelectFacetsGroupChange: (selectedFacets: SelectedFacet[]) => void;
  /**
   * Temporary array of selected facets for the ShowMoreModal before it's closed or saved
   */
  tempSelectedFacets?: SelectedFacet[];
  /**
   * Sets the state of the temporary array of selected facets for the ShowMoreModal before it's closed or saved
   */
  setTempSelectedFacets?: (selectedFacets: SelectedFacet[]) => void;
  /**
   * custom handler invoked when any input element changes in the SearchFacets component
   */
  onChange?: (e: SyntheticEvent<HTMLInputElement>) => void;
}

export const SingleSelectFacetsGroup: FC<SingleSelectFacetsGroupProps> = ({
  messages,
  facets,
  facetsTextField,
  selectedFacet,
  aggregationSettings,
  onSingleSelectFacetsGroupChange,
  onChange,
  tempSelectedFacets,
  setTempSelectedFacets,
  showMatchingResults
}) => {
  const {
    searchResponseStore: {
      parameters: { naturalLanguageQuery }
    }
  } = useContext(SearchContext);
  const escapedName = (aggregationSettings.name || aggregationSettings.field).replace(/\s+/g, '_');

  const handleOnClick = (event: SyntheticEvent<HTMLInputElement>): void => {
    // Check if exposed onChange function is called
    if (onChange) {
      onChange(event);
    }
    const target: HTMLInputElement = event.currentTarget;
    const selectedFacetName = target.getAttribute('data-name') || '';
    const selectedFacetKey = target.getAttribute('data-key') || '';
    const checked = true;

    // If this is in the Show more modal, we want to update tempSelectedFacets only
    if (tempSelectedFacets && setTempSelectedFacets) {
      setTempSelectedFacets([{ selectedFacetName, selectedFacetKey, checked }]);
    } else {
      // If this isn't in the Show more modal, we want to save the selection
      onSingleSelectFacetsGroupChange([{ selectedFacetName, selectedFacetKey, checked }]);
    }
  };

  // If this is in the Show more modal, we need to check for a temporary selection
  // and add a suffix to the selected facet value to make it unique
  let radioGroupNamePrefix = 'checkbox';
  let facetValueSelected = selectedFacet;
  if (tempSelectedFacets) {
    if (tempSelectedFacets.length > 0) {
      facetValueSelected = tempSelectedFacets[0].selectedFacetKey + '-modal';
    } else if (selectedFacet) {
      facetValueSelected = selectedFacet + '-modal';
    }
    // If this is in the Show more modal, the radio button group name needs to be unique
    radioGroupNamePrefix = 'modal-checkbox';
  }

  const radioGroupName = aggregationSettings.name || aggregationSettings.field;

  const renderRadioButton = (facet: any) => {
    const facetText = get(facet, facetsTextField, '');
    const count = facet.matching_results;
    const labelText = getFacetLabel(facetText, count, messages, showMatchingResults);
    const query = naturalLanguageQuery || '';
    const buff = Buffer.from(query + facetText);
    const base64data = buff.toString('base64');

    let facetValue = facetText;
    let keyAndIdPrefix = 'checkbox';
    if (tempSelectedFacets) {
      keyAndIdPrefix = 'modal-checkbox';
      facetValue = get(facet, facetsTextField, '') + '-modal';
    }
    return (
      <CarbonRadioButton
        className={optionLabelClass}
        labelText={labelText}
        key={`${keyAndIdPrefix}-${escapedName}-${base64data}`}
        id={`${keyAndIdPrefix}-${escapedName}-${facetText.replace(/\s+/g, '_')}`}
        value={facetValue}
        data-key={facetText}
        data-name={radioGroupName}
        onClick={handleOnClick}
      />
    );
  };

  return (
    <CarbonRadioButtonGroup
      name={radioGroupNamePrefix + radioGroupName}
      valueSelected={facetValueSelected}
      orientation={'vertical'}
      className={singleSelectGroupClass}
    >
      {facets.map(renderRadioButton)}
    </CarbonRadioButtonGroup>
  );
};
