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
   * i18n messages for the component
   */
  messages: Messages;
}

export const ModalSearchInput: FC<ModalSearchInputProps> = ({ facets, messages }) => {
  const handleOnChange = (event: any) => {
    let value = event.target.value;
    console.log(value);
    console.log(facets[0].key);
    const tempFacets = facets;
    let list = tempFacets.filter(facet => {
      if (facet.key) {
        return facet.key.toLowerCase().includes(value.toLowerCase());
      } else {
        return null;
      }
    });
    console.log(list);
  };

  return (
    <CarbonSearchInput
      labelText={messages.modalSearchBarPrompt}
      placeHolderText={messages.modalSearchBarPrompt}
      onChange={handleOnChange}
    />
  );
};
