import React, { FC, useState, useEffect, SyntheticEvent } from 'react';
import { Messages } from 'components/SearchFacets/messages';
import { Search as CarbonSearchInput } from 'carbon-components-react';
import {
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult
} from 'components/SearchFacets/utils/searchFacetInterfaces';

interface ModalSearchInputProps {
  /**
   * Facets configuration with fields and results counts
   */
  facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[];
  /**
   * Sets the list of filtered facets
   */
  setFilteredFacets: (
    value: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[]
  ) => void;
  /**
   * Specifies whether the modal is open
   */
  isModalOpen: boolean;
  /**
   * Facet label text
   */
  facetsLabel: string;
  /**
   * Facet text field
   */
  facetsTextField: 'key' | 'text';
  /**
   * i18n messages for the component
   */
  messages: Messages;
}

export const ModalSearchInput: FC<ModalSearchInputProps> = ({
  facets,
  setFilteredFacets,
  isModalOpen,
  facetsLabel,
  facetsTextField,
  messages
}) => {
  const [value, setValue] = useState<string>('');
  useEffect(() => {
    if (!isModalOpen) {
      setValue('');
      setFilteredFacets([...facets]);
    }
  }, [facets, isModalOpen, setFilteredFacets]);

  const handleOnChange = (event: SyntheticEvent<EventTarget>): void => {
    const target = event.currentTarget as HTMLInputElement;
    setValue(!!target ? target.value : '');
    const tempValue = !!target ? target.value : '';
    const tempFacets = [...facets];
    setFilteredFacets(
      tempFacets.filter(facet => {
        if (facet[facetsTextField]) {
          return facet[facetsTextField].toLowerCase().includes(tempValue.toLowerCase());
        }
        return null;
      })
    );
  };

  return (
    <CarbonSearchInput
      value={value}
      labelText={messages.modalSearchBarPrompt}
      placeholder={messages.modalSearchBarPrompt}
      onChange={handleOnChange}
      data-testid={`search-facet-modal-search-bar-${facetsLabel}`}
    />
  );
};
