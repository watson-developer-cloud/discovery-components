import React, { FC, useState, useEffect } from 'react';
import { Button } from 'carbon-components-react';
import filter from 'lodash/filter';
import get from 'lodash/get';
import ListBox from 'carbon-components-react/lib/components/ListBox';
import { fieldsetClasses, labelClasses, toggleMoreClass } from './refinementGroupClasses';
import {
  SelectableQuerySuggestedRefinement,
  SelectableQueryTermAggregationResult,
  AggregationSettings
} from '../../utils/searchRefinementInterfaces';
import { Messages } from '../../messages';
import { MultiSelectRefinementsGroup } from '../RefinementsGroups/MultiSelectRefinementsGroup';
import { SingleSelectRefinementsGroup } from '../RefinementsGroups/SingleSelectRefinementsGroup';

interface CollapsableRefinementsGroupProps {
  /**
   * Refinements configuration with fields and results counts
   */
  refinements: (SelectableQuerySuggestedRefinement | SelectableQueryTermAggregationResult)[];
  /**
   * Aggregation component settings
   */
  aggregationSettings: AggregationSettings;
  /**
   * How many refinements should be shown
   */
  collapsedRefinementsCount: number;
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * Refinement text field
   */
  refinementsTextField: 'key' | 'text';
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

export const CollapsableRefinementsGroup: FC<CollapsableRefinementsGroupProps> = ({
  refinements,
  aggregationSettings,
  collapsedRefinementsCount,
  refinementsTextField,
  messages,
  onClear,
  onChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    collapsedRefinementsCount < refinements.length
  );
  const [isCollapsable, setIsCollapsable] = useState<boolean>(
    collapsedRefinementsCount < refinements.length
  );

  useEffect(() => {
    setIsCollapsed(collapsedRefinementsCount < refinements.length);
    setIsCollapsable(collapsedRefinementsCount < refinements.length);
  }, [collapsedRefinementsCount]);

  const toggleRefinementsCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const areMultiSelectionsAllowed = aggregationSettings.multiple_selections_allowed;
  const refinementsLabel = aggregationSettings.label || aggregationSettings.field;
  const collapsedRefinements = isCollapsed
    ? refinements.slice(0, collapsedRefinementsCount)
    : refinements;
  const selectedRefinements = filter(refinements, ['selected', true]);
  const selectedRefinementText = get(selectedRefinements[0], refinementsTextField, '');
  const shouldDisplayAsMultiSelect = areMultiSelectionsAllowed || selectedRefinements.length > 1;
  const shouldDisplayClearButton = shouldDisplayAsMultiSelect && selectedRefinements.length > 0;
  const handleClearRefinements = (): void => {
    onClear(aggregationSettings.field);
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
        {shouldDisplayClearButton && (
          <ListBox.Selection
            clearSelection={handleClearRefinements}
            selectionCount={selectedRefinements.length}
            translateWithId={translateWithId}
          />
        )}
      </legend>
      {shouldDisplayAsMultiSelect ? (
        <MultiSelectRefinementsGroup
          refinements={collapsedRefinements}
          aggregationSettings={aggregationSettings}
          onChange={onChange}
          refinementsTextField={refinementsTextField}
        />
      ) : (
        <SingleSelectRefinementsGroup
          refinements={collapsedRefinements}
          aggregationSettings={aggregationSettings}
          onChange={onChange}
          selectedRefinement={selectedRefinementText}
          refinementsTextField={refinementsTextField}
        />
      )}
      {isCollapsable && (
        <Button
          className={toggleMoreClass}
          kind="ghost"
          size="small"
          onClick={toggleRefinementsCollapse}
        >
          {isCollapsed
            ? messages.collapsedRefinementShowMoreText
            : messages.collapsedRefinementShowLessText}
        </Button>
      )}
    </fieldset>
  );
};
