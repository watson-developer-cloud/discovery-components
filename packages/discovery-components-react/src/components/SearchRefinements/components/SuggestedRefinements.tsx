import React, { FC } from 'react';
import {
  SelectableQuerySuggestedRefinement,
  SearchFilterRefinements
} from '../utils/searchRefinementInterfaces';
import get from 'lodash/get';
import { Messages } from '../messages';
import { CollapsableRefinementsGroup } from './RefinementsGroups/CollapsableRefinementsGroup';

interface SuggestedRefinementsProps {
  /**
   * Suggested refinements text and selected flag
   */
  suggestedRefinements: SelectableQuerySuggestedRefinement[];
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * Number of refinement terms to show when list is collapsed
   */
  collapsedRefinementsCount: number;
  /**
   * Callback to handle changes in selected refinements
   */
  onChange: (updatedRefinement: Partial<SearchFilterRefinements>) => void;
}

export const SuggestedRefinements: FC<SuggestedRefinementsProps> = ({
  suggestedRefinements,
  messages,
  collapsedRefinementsCount,
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

  const aggregationSettings = {
    label: messages.suggestedRefinementsLabel,
    multiple_selections_allowed: true,
    field: ''
  };

  return (
    <CollapsableRefinementsGroup
      aggregationSettings={aggregationSettings}
      collapsedRefinementsCount={collapsedRefinementsCount}
      refinements={suggestedRefinements}
      refinementsTextField="text"
      onChange={handleOnChange}
      onClear={handleOnClear}
      messages={messages}
    />
  );
};
