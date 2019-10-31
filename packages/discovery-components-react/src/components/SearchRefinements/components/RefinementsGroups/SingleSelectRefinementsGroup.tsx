import React, { FC, useContext, SyntheticEvent } from 'react';
import { fieldsetClasses, labelClasses, optionLabelClass } from './refinementGroupClasses';
import {
  RadioButtonGroup as CarbonRadioButtonGroup,
  RadioButton as CarbonRadioButton
} from 'carbon-components-react';
import { SearchContext } from '../../../DiscoverySearch/DiscoverySearch';
import {
  SelectableQuerySuggestedRefinement,
  SelectableQueryTermAggregationResult
} from '../../utils/searchRefinementInterfaces';
import get from 'lodash/get';

interface SingleSelectRefinementsGroupProps {
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
   * Text of selected refinement
   */
  selectedRefinement: string;
  /**
   * Callback to handle changes in selected refinements
   */
  onChange: (
    selectedRefinementField: string,
    selectedRefinementKey: string,
    checked: boolean
  ) => void;
}

export const SingleSelectRefinementsGroup: FC<SingleSelectRefinementsGroupProps> = ({
  refinements,
  attributeKeyName,
  refinementsLabel,
  selectedRefinement,
  onChange
}) => {
  const {
    searchParameters: { naturalLanguageQuery }
  } = useContext(SearchContext);
  const escapedLabel = refinementsLabel.replace(/\s+/g, '_');

  const handleOnClick = (event: SyntheticEvent<HTMLInputElement>): void => {
    const target: HTMLInputElement = event.currentTarget;
    const field = target.getAttribute('name') || '';
    const text = target.getAttribute('value') || '';
    onChange(field, text, true);
  };

  return (
    <fieldset className={fieldsetClasses.join(' ')}>
      <legend className={labelClasses.join(' ')}>{refinementsLabel}</legend>
      <CarbonRadioButtonGroup name={`${refinementsLabel}`} valueSelected={selectedRefinement}>
        {refinements.map(refinement => {
          const text = get(refinement, attributeKeyName, '');
          const query = naturalLanguageQuery || '';
          const buff = new Buffer(query + text);
          const base64data = buff.toString('base64');

          return (
            <CarbonRadioButton
              className={optionLabelClass}
              labelText={text}
              key={`checkbox-${escapedLabel}-${base64data}`}
              id={`checkbox-${escapedLabel}-${text.replace(/\s+/g, '_')}`}
              value={text}
              onClick={handleOnClick}
            />
          );
        })}
      </CarbonRadioButtonGroup>
    </fieldset>
  );
};
