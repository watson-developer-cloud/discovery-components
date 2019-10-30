import React, { FC, SyntheticEvent } from 'react';
import {
  SelectableSuggestedRefinement,
  SearchFilterRefinements
} from '../utils/searchRefinementInterfaces';
import get from 'lodash/get';
import { RefinementsGroup } from './RefinementsGroup';

interface SuggestedRefinementsProps {
  /**
   * Suggested refinements text and selected flag
   */
  suggestedRefinements: SelectableSuggestedRefinement[];
  /**
   * Label used for suggested refinements group
   */
  suggestedRefinementsLabel: string;
  /**
   * Callback to handle changes in selected refinements
   */
  onChange: (updatedRefinement: Partial<SearchFilterRefinements>) => void;
}

export const SuggestedRefinements: FC<SuggestedRefinementsProps> = ({
  suggestedRefinements,
  suggestedRefinementsLabel,
  onChange
}) => {
  const handleOnChange = (
    checked: boolean,
    _id: string,
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    const target: HTMLInputElement = event.currentTarget;
    const selectedRefinementText = target.getAttribute('data-key');
    const newSuggestedRefinements: SelectableSuggestedRefinement[] = suggestedRefinements.map(
      suggestion => {
        const text = get(suggestion, 'text', '');
        return text === selectedRefinementText
          ? Object.assign({}, suggestion, { selected: checked })
          : suggestion;
      }
    );
    onChange({ filterSuggested: newSuggestedRefinements });
  };

  return (
    <RefinementsGroup
      refinements={suggestedRefinements}
      onChange={handleOnChange}
      refinementsLabel={suggestedRefinementsLabel}
      attributeKeyName="text"
    />
  );
};
