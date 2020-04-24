import React, { FC, useState, useEffect, FormEvent } from 'react';
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
   * i18n messages for the component
   */
  messages: Messages;
}

export const ModalSearchInput: FC<ModalSearchInputProps> = ({
  facets,
  setFilteredFacets,
  isModalOpen,
  messages
}) => {
  const [value, setValue] = useState<string>('');
  useEffect(() => {
    if (!isModalOpen) {
      setValue('');
      setFilteredFacets([...facets]);
    }
  }, [facets, isModalOpen, setFilteredFacets]);

  const handleOnChange = (event: FormEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
    const tempValue = event.currentTarget.value;
    const tempFacets = [...facets];
    setFilteredFacets(
      tempFacets.filter(facet => {
        if (facet.key) {
          return facet.key.toLowerCase().includes(tempValue.toLowerCase());
        }
        return null;
      })
    );
  };

  return (
    <CarbonSearchInput
      value={value}
      labelText={messages.modalSearchBarPrompt}
      placeHolderText={messages.modalSearchBarPrompt}
      onChange={handleOnChange}
    />
  );
};
