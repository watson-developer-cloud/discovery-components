import React, { FC } from 'react';
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
  setFilteredFacets: any;
  /**
   * i18n messages for the component
   */
  messages: Messages;
}

export const ModalSearchInput: FC<ModalSearchInputProps> = ({
  facets,
  setFilteredFacets,
  messages
}) => {
  const handleOnChange = (event: any) => {
    const value = event.target.value;
    const tempFacets = [...facets];

    setFilteredFacets(
      tempFacets.filter(facet => {
        if (facet.key) {
          return facet.key.toLowerCase().includes(value.toLowerCase());
        } else {
          return null;
        }
      })
    );
  };

  return (
    <CarbonSearchInput
      labelText={messages.modalSearchBarPrompt}
      placeHolderText={messages.modalSearchBarPrompt}
      onChange={handleOnChange}
    />
  );
};
