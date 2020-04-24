import React, { FC, useState } from 'react';
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
   * True if the search facet modal is open
   */
  modalIsOpen: boolean;
  /**
   * i18n messages for the component
   */
  messages: Messages;
}

export const ModalSearchInput: FC<ModalSearchInputProps> = ({ facets, modalIsOpen, messages }) => {
  const [searchBarValue, setSearchBarValue] = useState<any>();

  // Clear search bar if modal is closed
  if (!modalIsOpen) {
    setSearchBarValue('');
    console.log('clear search bar');
  }

  const handleOnChange = (event: any) => {
    let value = event.target.value;
    const tempFacets = [...facets];

    const facetList = tempFacets.filter(facet => {
      if (facet.key) {
        return facet.key.toLowerCase().includes(value.toLowerCase());
      } else {
        return null;
      }
    });

    console.log(value);
    console.log(facetList);
  };

  return (
    <CarbonSearchInput
      labelText={messages.modalSearchBarPrompt}
      placeHolderText={messages.modalSearchBarPrompt}
      onChange={handleOnChange}
    />
  );
};
