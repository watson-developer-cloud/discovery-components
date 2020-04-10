import React, { FC, useContext } from 'react';
import get from 'lodash/get';
import { ModalWrapper, Checkbox as CarbonCheckbox } from 'carbon-components-react';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import { formatMessage } from 'utils/formatMessage';
import { optionLabelClass, optionClass } from '../../cssClasses';
import { Messages } from 'components/SearchFacets/messages';
import {
  InternalQueryTermAggregation,
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult
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
}

export const ShowMoreModal: FC<ShowMoreModalProps> = ({
  messages,
  aggregationSettings,
  facets,
  facetsLabel,
  facetsTextField
}) => {
  const {
    searchResponseStore: {
      parameters: { naturalLanguageQuery }
    }
  } = useContext(SearchContext);

  const handleOnRequestSubmit = () => {
    // todo: this needs to handle updating with the selections/deselections that a user makes while within the modal view
    console.log('hello!');
  };

  // todo: make this a util since now being used in a few places?
  const getLabel = (facetText: string, count: number | undefined) => {
    return count !== undefined
      ? formatMessage(messages.labelTextWithCount, { facetText: facetText, count: count }, false)
      : formatMessage(messages.labelText, { facetText: facetText }, false);
  };

  // todo: also make this a util since being used in a few places?
  const escapedName = (aggregationSettings.name || aggregationSettings.field).replace(/\s+/g, '_');

  return (
    <ModalWrapper
      // todo: add this to css classes to import and use bx prefix settings
      className="bx--search-facets--modal"
      buttonTriggerText={messages.collapsedFacetShowMoreText}
      triggerButtonKind="ghost"
      modalHeading={facetsLabel}
      onRequestSubmit={handleOnRequestSubmit}
      // todo: i18n this
      modalAriaLabel="Select and deselect facet values"
      // todo: confirm this is best aria-label
      aria-label={facetsLabel}
    >
      {/* todo: can this be shared with multiselect facets group? */}
      {facets.map(facet => {
        const facetText = get(facet, facetsTextField, '');
        const count = facet.matching_results;
        const labelText = getLabel(facetText, count);
        const query = naturalLanguageQuery || '';
        const buff = new Buffer(query + facetText);
        const base64data = buff.toString('base64');

        return (
          <CarbonCheckbox
            className={optionLabelClass}
            wrapperClassName={optionClass}
            // store them in temporary facets that have changed
            // on request submit go through and update them all
            // onChange={handleOnChange}
            labelText={labelText}
            key={`checkbox-${escapedName}-${base64data}`}
            id={`checkbox-${escapedName}-${facetText.replace(/\s+/g, '_')}`}
            data-name={aggregationSettings.name || aggregationSettings.field}
            data-key={facetText}
            // checked can check the temporary updates first and then the facet's status on open of modal?
            checked={!!facet.selected}
          />
        );
      })}
    </ModalWrapper>
  );
};
