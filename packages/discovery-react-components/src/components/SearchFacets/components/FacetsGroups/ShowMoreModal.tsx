import React, { FC, useContext, useState, SyntheticEvent } from 'react';
import get from 'lodash/get';
import { Modal, Checkbox as CarbonCheckbox } from 'carbon-components-react';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import { formatMessage } from 'utils/formatMessage';
import { optionLabelClass, optionClass, showMoreModalClass } from '../../cssClasses';
import { Messages } from 'components/SearchFacets/messages';
import {
  InternalQueryTermAggregation,
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult,
  SelectedFacet
} from 'components/SearchFacets/utils/searchFacetInterfaces';

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
  facetsTextField: string;
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
}

export const ShowMoreModal: FC<ShowMoreModalProps> = ({
  messages,
  aggregationSettings,
  facets,
  facetsLabel,
  facetsTextField,
  onChange,
  isOpen,
  setIsModalOpen
}) => {
  const {
    searchResponseStore: {
      parameters: { naturalLanguageQuery }
    }
  } = useContext(SearchContext);

  const [tempSelectedFacets, setTempSelectedFacets] = useState<SelectedFacet[]>([]);

  const handleOnRequestSubmit = () => {
    onChange(tempSelectedFacets);
    setTempSelectedFacets([]);
    setIsModalOpen(false);
  };

  // todo: make this a util since now being used in a few places?
  const getLabel = (facetText: string, count: number | undefined) => {
    return count !== undefined
      ? formatMessage(messages.labelTextWithCount, { facetText: facetText, count: count }, false)
      : formatMessage(messages.labelText, { facetText: facetText }, false);
  };

  // todo: also make this a util since being used in a few places?
  const escapedName = (aggregationSettings.name || aggregationSettings.field).replace(/\s+/g, '_');

  const handleOnChange = (
    checked: boolean,
    _id: string,
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    const target: HTMLInputElement = event.currentTarget;
    const selectedFacetName = target.getAttribute('data-name') || '';
    const selectedFacetKey = target.getAttribute('data-key') || '';
    const selectedFacetIndex = tempSelectedFacets.findIndex(selectedFacet => {
      return selectedFacetKey === selectedFacet.selectedFacetKey;
    });
    if (selectedFacetIndex > -1) {
      const tempSelectedFacetsCopy = [...tempSelectedFacets];
      tempSelectedFacetsCopy[selectedFacetIndex].checked = checked;
      setTempSelectedFacets(tempSelectedFacetsCopy);
    } else {
      setTempSelectedFacets(
        tempSelectedFacets.concat({ selectedFacetName, selectedFacetKey, checked })
      );
    }
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
      {/* todo: can this be shared with multiselect facets group? depends, I think on if can */}
      {/* pass through the differences between them */}
      {facets.map(facet => {
        const facetText = get(facet, facetsTextField, '');
        const count = facet.matching_results;
        const labelText = getLabel(facetText, count);
        const query = naturalLanguageQuery || '';
        const buff = new Buffer(query + facetText);
        const base64data = buff.toString('base64');

        let facetSelected: boolean;
        const tempIndex = tempSelectedFacets.findIndex(facet => {
          return facet.selectedFacetKey === facetText;
        });
        if (tempIndex > -1) {
          facetSelected = tempSelectedFacets[tempIndex].checked;
        } else {
          facetSelected = !!facet.selected;
        }

        return (
          <CarbonCheckbox
            className={optionLabelClass}
            wrapperClassName={optionClass}
            onChange={handleOnChange}
            labelText={labelText}
            key={`modal-checkbox-${escapedName}-${base64data}`}
            id={`modal-checkbox-${escapedName}-${facetText.replace(/\s+/g, '_')}`}
            data-name={aggregationSettings.name || aggregationSettings.field}
            data-key={facetText}
            checked={facetSelected}
          />
        );
      })}
    </Modal>
  );
};
