import React, { FC } from 'react';
import {
  SelectableQuerySuggestedRefinement,
  SearchFilterRefinements
} from '../utils/searchRefinementInterfaces';
import get from 'lodash/get';
import { MultiSelectRefinementsGroup } from './RefinementsGroups/MultiSelectRefinementsGroup';
import { Messages } from '../messages';

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
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * Callback to handle changes in selected refinements
   */
  onChange: (updatedRefinement: Partial<SearchFilterRefinements>) => void;
}

export const SuggestedRefinements: FC<SuggestedRefinementsProps> = ({
  suggestedRefinements,
  suggestedRefinementsLabel,
  messages,
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

  const handleOnClear = (): void => {
    const filterSuggested = suggestedRefinements.map(refinement => {
      return { ...refinement, selected: false };
    });
    onChange({ filterSuggested });
  };

  return (
    <MultiSelectRefinementsGroup
      refinements={suggestedRefinements}
      onChange={handleOnChange}
      onClear={handleOnClear}
      refinementsLabel={suggestedRefinementsLabel}
      refinementsField={''}
      attributeKeyName="text"
      messages={messages}
    />
  );
};
