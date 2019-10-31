import React, { FC } from 'react';
import {
  SelectableQuerySuggestedRefinement,
  SearchFilterRefinements
} from '../utils/searchRefinementInterfaces';
import get from 'lodash/get';
import { MultiSelectRefinementsGroup } from './RefinementsGroups/MultiSelectRefinementsGroup';

interface SuggestedRefinementsProps {
  /**
   * Suggested refinements text and selected flag
   */
  suggestedRefinements: SelectableQuerySuggestedRefinement[];
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
    _selectedRefinementField: string,
    selectedRefinementKey: string,
    checked: boolean
  ): void => {
    const newSuggestedRefinements: SelectableQuerySuggestedRefinement[] = suggestedRefinements.map(
      suggestion => {
        const text = get(suggestion, 'text', '');
        return text === selectedRefinementKey
          ? Object.assign({}, suggestion, { selected: checked })
          : suggestion;
      }
    );
    onChange({ filterSuggested: newSuggestedRefinements });
  };

  return (
    <MultiSelectRefinementsGroup
      refinements={suggestedRefinements}
      onChange={handleOnChange}
      refinementsLabel={suggestedRefinementsLabel}
      attributeKeyName="text"
    />
  );
};
