import React, { FC, useContext, SyntheticEvent } from 'react';
import {
  RadioButtonGroup as CarbonRadioButtonGroup,
  RadioButton as CarbonRadioButton
} from 'carbon-components-react';
import { SearchContext } from '../../../DiscoverySearch/DiscoverySearch';
import { optionLabelClass, singleSelectGroupClass } from './refinementGroupClasses';
import {
  SelectableQuerySuggestedRefinement,
  SelectableQueryTermAggregationResult,
  AggregationSettings
} from '../../utils/searchRefinementInterfaces';
import get from 'lodash/get';

interface SingleSelectRefinementsGroupProps {
  /**
   * refinements text and selected flag
   */
  refinements: (SelectableQuerySuggestedRefinement | SelectableQueryTermAggregationResult)[];
  /**
   * Aggregation component settings
   */
  aggregationSettings: AggregationSettings;
  /**
   * Refinement text field
   */
  refinementsTextField: 'key' | 'text';
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
  refinementsTextField,
  selectedRefinement,
  aggregationSettings,
  onChange
}) => {
  const {
    searchParameters: { naturalLanguageQuery }
  } = useContext(SearchContext);
  const refinementsLabel = aggregationSettings.label || aggregationSettings.field;
  const escapedLabel = refinementsLabel.replace(/\s+/g, '_');

  const handleOnClick = (event: SyntheticEvent<HTMLInputElement>): void => {
    const target: HTMLInputElement = event.currentTarget;
    const field = target.getAttribute('name') || '';
    const text = target.getAttribute('value') || '';
    onChange(field, text, true);
  };

  return (
    <CarbonRadioButtonGroup
      name={aggregationSettings.field}
      valueSelected={selectedRefinement}
      orientation={'vertical'}
      className={singleSelectGroupClass}
    >
      {refinements.map(refinement => {
        const text = get(refinement, refinementsTextField, '');
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
  );
};
