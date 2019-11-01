import React, { FC, useContext, SyntheticEvent } from 'react';
import ListBox from 'carbon-components-react/lib/components/ListBox';
import {
  fieldsetClasses,
  labelClasses,
  optionClass,
  optionLabelClass
} from './refinementGroupClasses';
import { Checkbox as CarbonCheckbox } from 'carbon-components-react';
import { SearchContext } from '../../../DiscoverySearch/DiscoverySearch';
import {
  SelectableQuerySuggestedRefinement,
  SelectableQueryTermAggregationResult
} from '../../utils/searchRefinementInterfaces';
import { Messages } from '../../messages';
import get from 'lodash/get';

interface MultiSelectRefinementsGroupProps {
  /**
   * Suggested refinements text and selected flag
   */
  refinements: (SelectableQuerySuggestedRefinement | SelectableQueryTermAggregationResult)[];
  /**
   * Refinement text field
   */
  attributeKeyName: 'key' | 'text';
  /**
   * Label used for suggested refinements group
   */
  refinementsLabel: string;
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * Callback to handle changes in selected refinements
   */
  onChange: (
    selectedRefinementField: string,
    selectedRefinementKey: string,
    checked: boolean
  ) => void;
  /**
   * Callback to reset selected refinements
   */
  onClear: (field: string) => void;
}

export const MultiSelectRefinementsGroup: FC<MultiSelectRefinementsGroupProps> = ({
  refinements,
  attributeKeyName,
  refinementsLabel,
  messages,
  onChange,
  onClear
}) => {
  const {
    searchParameters: { naturalLanguageQuery }
  } = useContext(SearchContext);
  const escapedLabel = refinementsLabel.replace(/\s+/g, '_');
  const selectedRefinements = refinements.filter(refinement => refinement.selected);

  const handleOnChange = (
    checked: boolean,
    _id: string,
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    const target: HTMLInputElement = event.currentTarget;
    const selectedRefinementField = target.getAttribute('data-field') || '';
    const selectedRefinementKey = target.getAttribute('data-key') || '';

    onChange(selectedRefinementField, selectedRefinementKey, checked);
  };
  const handleClearRefinements = (): void => {
    // TODO this should be refinementsField
    onClear(refinementsLabel);
  };
  const translateWithId = (id: string): string => {
    const mapping = {
      'clear.all': messages.clearRefinementTitle,
      'clear.selection': messages.clearRefinementSelectionTitle
    };
    return mapping[id];
  };

  return (
    <fieldset className={fieldsetClasses.join(' ')}>
      <legend className={labelClasses.join(' ')}>
        {refinementsLabel}
        {selectedRefinements.length > 0 && (
          <ListBox.Selection
            clearSelection={handleClearRefinements}
            selectionCount={selectedRefinements.length}
            translateWithId={translateWithId}
          />
        )}
      </legend>
      {refinements.map(refinement => {
        const text = get(refinement, attributeKeyName, '');
        const query = naturalLanguageQuery || '';
        const buff = new Buffer(query + text);
        const base64data = buff.toString('base64');

        return (
          <CarbonCheckbox
            className={optionLabelClass}
            wrapperClassName={optionClass}
            onChange={handleOnChange}
            labelText={text}
            key={`checkbox-${escapedLabel}-${base64data}`}
            id={`checkbox-${escapedLabel}-${text.replace(/\s+/g, '_')}`}
            data-field={refinementsLabel}
            data-key={text}
            checked={!!refinement.selected}
          />
        );
      })}
    </fieldset>
  );
};
