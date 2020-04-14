import React, { FC, useState } from 'react';
import { Modal } from 'carbon-components-react';
import { showMoreModalClass } from 'components/SearchFacets/cssClasses';
import { Messages } from 'components/SearchFacets/messages';
import {
  InternalQueryTermAggregation,
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult,
  SelectedFacet
} from 'components/SearchFacets/utils/searchFacetInterfaces';
import { MultiSelectFacetsGroup } from './MultiSelectFacetsGroup';
import { SingleSelectFacetsGroup } from './SingleSelectFacetsGroup';

interface ShowMoreModalProps {
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * Aggregation component settings
   */
  aggregationSettings: InternalQueryTermAggregation;
  /**
   * Facets configuration with fields and results counts
   */
  facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[];
  /**
   * Facet label text
   */
  facetsLabel: string;
  /**
   * Facet text field
   */
  facetsTextField: 'key' | 'text';
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (selectedFacets: SelectedFacet[]) => void;
  /**
   * specifies whether the modal is open
   */
  isOpen: boolean;
  /**
   * used to set the modal to closed state when modal is saved or otherwise closed
   */
  setIsModalOpen: (value: boolean) => void;
  shouldDisplayAsMultiSelect: boolean;
  selectedFacet: string;
}

export const ShowMoreModal: FC<ShowMoreModalProps> = ({
  messages,
  aggregationSettings,
  facets,
  facetsLabel,
  facetsTextField,
  onChange,
  isOpen,
  setIsModalOpen,
  shouldDisplayAsMultiSelect,
  selectedFacet
}) => {
  const [tempSelectedFacets, setTempSelectedFacets] = useState<SelectedFacet[]>([]);

  const handleOnRequestSubmit = () => {
    onChange(tempSelectedFacets);
    setTempSelectedFacets([]);
    setIsModalOpen(false);
  };

  const handleOnRequestClose = () => {
    setTempSelectedFacets([]);
    setIsModalOpen(false);
  };

  return (
    <Modal
      className={showMoreModalClass}
      modalHeading={facetsLabel}
      onRequestSubmit={handleOnRequestSubmit}
      id="search-facet-show-more-modal"
      onRequestClose={handleOnRequestClose}
      // todo: update modal's aria-label
      modalAriaLabel={facetsLabel}
      aria-label={facetsLabel}
      open={isOpen}
      primaryButtonText={messages.showMoreModalPrimaryButtonText}
      secondaryButtonText={messages.showMoreModalSecondaryButtonText}
      data-testid={`search-facet-show-more-modal-${facetsLabel}`}
    >
      {shouldDisplayAsMultiSelect ? (
        <MultiSelectFacetsGroup
          messages={messages}
          facets={facets}
          aggregationSettings={aggregationSettings}
          onChange={onChange}
          facetsTextField={facetsTextField}
          tempSelectedFacets={tempSelectedFacets}
          setTempSelectedFacets={setTempSelectedFacets}
        />
      ) : (
        <SingleSelectFacetsGroup
          messages={messages}
          facets={facets}
          aggregationSettings={aggregationSettings}
          onChange={onChange}
          selectedFacet={selectedFacet}
          facetsTextField={facetsTextField}
          tempSelectedFacets={tempSelectedFacets}
          setTempSelectedFacets={setTempSelectedFacets}
        />
      )}
    </Modal>
  );
};
