import React, { FC, useContext, SyntheticEvent } from 'react';
import { Buffer } from 'buffer';
import { optionClass, optionLabelClass } from 'components/SearchFacets/cssClasses';
import { Messages } from 'components/SearchFacets/messages';
import { Checkbox as CarbonCheckbox } from 'carbon-components-react';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import {
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult,
  InternalQueryTermAggregation,
  SelectedFacet
} from 'components/SearchFacets/utils/searchFacetInterfaces';
import { getFacetLabel } from 'components/SearchFacets/utils/getFacetLabel';
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
  onMultiSelectFacetsGroupChange: (selectedFacets: SelectedFacet[]) => void;
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

export const MultiSelectFacetsGroup: FC<MultiSelectFacetsGroupProps> = ({
  messages,
  facets,
  facetsTextField,
  aggregationSettings,
  onMultiSelectFacetsGroupChange,
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

  const handleOnChange = (
    checked: boolean,
    _id: string,
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    // Check if exposed onChange function is called
    if (onChange) {
      onChange(event);
    }
    const target: HTMLInputElement = event.currentTarget;
    const selectedFacetName = target.getAttribute('data-name') || '';
    const selectedFacetKey = target.getAttribute('data-key') || '';

    // If this is in the Show more modal, we want to update tempSelectedFacets only
    if (tempSelectedFacets && setTempSelectedFacets) {
      const selectedFacetIndex = tempSelectedFacets.findIndex(
        selectedFacet => selectedFacetKey === selectedFacet.selectedFacetKey
      );
      if (selectedFacetIndex > -1) {
        const tempSelectedFacetsCopy = [...tempSelectedFacets];
        tempSelectedFacetsCopy[selectedFacetIndex].checked = checked;
        setTempSelectedFacets(tempSelectedFacetsCopy);
      } else {
        setTempSelectedFacets(
          tempSelectedFacets.concat({ selectedFacetName, selectedFacetKey, checked })
        );
      }
    } else {
      // If this isn't in the Show more modal, we want to save the selection
      onMultiSelectFacetsGroupChange([{ selectedFacetName, selectedFacetKey, checked }]);
    }
  };

  return (
    <>
      {facets.map(facet => {
        const facetText = get(facet, facetsTextField, '');
        const count = facet.matching_results;
        const labelText = getFacetLabel(facetText, count, messages, showMatchingResults);
        const query = naturalLanguageQuery || '';
        const buff = Buffer.from(query + facetText);
        const base64data = buff.toString('base64');

        // If this is in the Show more modal, we need to check the facet value's temporary selection value
        let facetSelected = !!facet.selected;
        if (tempSelectedFacets) {
          tempSelectedFacets.every(({ selectedFacetKey, checked }) => {
            if (selectedFacetKey === facetText) {
              facetSelected = !!checked;
              return false; // break from loop
            }
            return true;
          });
        }

        let keyAndIdPrefix = tempSelectedFacets ? 'modal-checkbox' : 'checkbox';

        return (
          <CarbonCheckbox
            className={optionLabelClass}
            wrapperClassName={optionClass}
            onChange={handleOnChange}
            labelText={labelText}
            key={`${keyAndIdPrefix}-${escapedName}-${base64data}`}
            id={`${keyAndIdPrefix}-${escapedName}-${facetText.replace(/\s+/g, '_')}`}
            data-name={aggregationSettings.name || aggregationSettings.field}
            data-key={facetText}
            checked={facetSelected}
          />
        );
      })}
    </>
  );
};
