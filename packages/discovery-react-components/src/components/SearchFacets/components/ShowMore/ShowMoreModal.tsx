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
import { MultiSelectFacetsGroup } from '../FacetsGroups/MultiSelectFacetsGroup';
import { SingleSelectFacetsGroup } from '../FacetsGroups/SingleSelectFacetsGroup';
import { ModalSearchInput } from './ModalSearchInput';
import { EmptyModalState } from './EmptyModalState';

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
   * Specifies whether the modal is open
   */
  isOpen: boolean;
  /**
   * Used to set the modal to closed state when modal is saved or otherwise closed
   */
  setIsModalOpen: (value: boolean) => void;
  /**
   * Whether the facet should be displayed as multiselect or single-select
   */
  shouldDisplayAsMultiSelect: boolean;
  /**
   * Selected facet for single-select
   */
  selectedFacet: string;
  /**
   * Show matching documents count as part of label
   */
  showMatchingResults: boolean;
  /**
   * If more than 15 facets, adds a search bar
   */
  hasSearchBar: boolean;
  /**
   * Category name if the modal is for a category facet group
   */
  categoryName?: string;
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
  selectedFacet,
  showMatchingResults,
  hasSearchBar,
  categoryName
}) => {
  const [tempSelectedFacets, setTempSelectedFacets] = useState<SelectedFacet[]>([]);
  const [filteredFacets, setFilteredFacets] = useState<
    (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[]
  >();

  const handleOnRequestSubmit = () => {
    onChange(tempSelectedFacets);
    setTempSelectedFacets([]);
    setIsModalOpen(false);
  };

  const handleOnRequestClose = () => {
    setTempSelectedFacets([]);
    setIsModalOpen(false);
  };

  const modalHeading = (
    <>
      {categoryName ? `${facetsLabel}: ${categoryName}` : facetsLabel}
      {hasSearchBar ? (
        <ModalSearchInput
          facets={facets}
          messages={messages}
          setFilteredFacets={setFilteredFacets}
          isModalOpen={isOpen}
          facetsLabel={facetsLabel}
        />
      ) : (
        <></>
      )}
    </>
  );

  return (
    <Modal
      className={showMoreModalClass}
      modalHeading={modalHeading}
      onRequestSubmit={handleOnRequestSubmit}
      onRequestClose={handleOnRequestClose}
      modalAriaLabel={messages.showMoreModalAriaLabel}
      aria-label={messages.showMoreModalAriaLabel}
      open={isOpen}
      primaryButtonText={messages.showMoreModalPrimaryButtonText}
      secondaryButtonText={messages.showMoreModalSecondaryButtonText}
      data-testid={`search-facet-show-more-modal-${facetsLabel}`}
    >
      {filteredFacets && filteredFacets.length == 0 ? (
        <EmptyModalState messages={messages} />
      ) : (
        <></>
      )}
      {shouldDisplayAsMultiSelect ? (
        <MultiSelectFacetsGroup
          messages={messages}
          facets={filteredFacets || facets}
          aggregationSettings={aggregationSettings}
          onChange={onChange}
          facetsTextField={facetsTextField}
          tempSelectedFacets={tempSelectedFacets}
          setTempSelectedFacets={setTempSelectedFacets}
          showMatchingResults={showMatchingResults}
        />
      ) : (
        <SingleSelectFacetsGroup
          messages={messages}
          facets={filteredFacets || facets}
          aggregationSettings={aggregationSettings}
          onChange={onChange}
          selectedFacet={selectedFacet}
          facetsTextField={facetsTextField}
          tempSelectedFacets={tempSelectedFacets}
          setTempSelectedFacets={setTempSelectedFacets}
          showMatchingResults={showMatchingResults}
        />
      )}
    </Modal>
  );
};
