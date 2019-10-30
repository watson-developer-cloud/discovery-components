import React, { FC, useContext, SyntheticEvent } from 'react';
import { settings } from 'carbon-components';
import { Checkbox as CarbonCheckbox } from 'carbon-components-react';
import { SearchContext } from '../../DiscoverySearch/DiscoverySearch';
import {
  SelectableSuggestedRefinement,
  QueryTermAggregation
} from '../utils/searchRefinementInterfaces';
import get from 'lodash/get';

interface RefinementGroupProps {
  /**
   * Suggested refinements text and selected flag
   */
  refinements: (SelectableSuggestedRefinement | QueryTermAggregation)[];
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
  onChange: (checked: boolean, _id: string, event: SyntheticEvent<HTMLInputElement>) => void;
}

export const RefinementsGroup: FC<RefinementGroupProps> = ({
  refinements,
  attributeKeyName,
  refinementsLabel,
  onChange
}) => {
  const baseClass = `${settings.prefix}--search-refinement`;
  const fieldsetClasses = [`${settings.prefix}--fieldset`, baseClass];
  const labelClasses = [`${settings.prefix}--label`, `${baseClass}__refinement_label`];
  const optionClass = `${baseClass}__refinement__option`;
  const optionLabelClass = `${baseClass}__refinement__option-label`;

  const {
    searchParameters: { naturalLanguageQuery }
  } = useContext(SearchContext);
  const escapedLabel = refinementsLabel.replace(/\s+/g, '_');

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
            onChange={onChange}
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
