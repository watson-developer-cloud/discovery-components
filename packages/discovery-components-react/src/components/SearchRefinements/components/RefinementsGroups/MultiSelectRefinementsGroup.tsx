import React, { FC, useContext, SyntheticEvent } from 'react';
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
   * Callback to handle changes in selected refinements
   */
  onChange: (
    selectedRefinementField: string,
    selectedRefinementKey: string,
    checked: boolean
  ) => void;
}

export const MultiSelectRefinementsGroup: FC<MultiSelectRefinementsGroupProps> = ({
  refinements,
  attributeKeyName,
  refinementsLabel,
  onChange
}) => {
  const {
    searchParameters: { naturalLanguageQuery }
  } = useContext(SearchContext);
  const escapedLabel = refinementsLabel.replace(/\s+/g, '_');

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

  return (
    <fieldset className={fieldsetClasses.join(' ')}>
      <legend className={labelClasses.join(' ')}>{refinementsLabel}</legend>
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
            defaultChecked={refinement.selected}
          />
        );
      })}
    </fieldset>
  );
};
