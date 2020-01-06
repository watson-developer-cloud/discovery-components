import React, { FC, useState } from 'react';
import { RuleGroup } from './components/RuleGroup/RuleGroup';
import { AddRuleRowButton } from './components/AddRuleRowButton/AddRuleRowButton';
import { AddRuleGroupButton } from './components/AddRuleGroupButton/AddRuleGroupButton';
import { defaultMessages, Messages } from './messages';
import { structuredQueryClass, structuredQueryRulesButtonsClass } from './cssClasses';
import { MAX_NUM_SIBLING_RULE_ROWS, MAX_NUM_RULE_GROUPS } from './constants';
import { StructuredQuerySelection } from './utils/structuredQueryInterfaces';
import { withErrorBoundary } from 'react-error-boundary';
import { FallbackComponent } from 'utils/FallbackComponent';
import onErrorCallback from 'utils/onErrorCallback';

export interface StructuredQueryProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages?: Partial<Messages>;
}

const StructuredQuery: FC<StructuredQueryProps> = ({ messages = defaultMessages }) => {
  const mergedMessages = { ...defaultMessages, ...messages };
  const [structuredQuerySelection, setStructuredQuerySelection] = useState<
    StructuredQuerySelection
  >({
    rows: [{ id: 0 }],
    groups: []
  });
  const showAddRuleRowButton = structuredQuerySelection.rows.length < MAX_NUM_SIBLING_RULE_ROWS;
  const showAddRuleGroupButton = structuredQuerySelection.groups.length < MAX_NUM_RULE_GROUPS;

  return (
    <div className={structuredQueryClass}>
      <RuleGroup
        messages={mergedMessages}
        groupId="top-level"
        structuredQuerySelection={structuredQuerySelection}
        setStructuredQuerySelection={setStructuredQuerySelection}
      />
      {structuredQuerySelection.groups.map(group => {
        return (
          <RuleGroup
            messages={mergedMessages}
            groupId={group.id}
            structuredQuerySelection={structuredQuerySelection}
            setStructuredQuerySelection={setStructuredQuerySelection}
            key={group.id}
          />
        );
      })}
      <div className={structuredQueryRulesButtonsClass}>
        {showAddRuleRowButton && (
          <AddRuleRowButton
            addRuleRowText={mergedMessages.addRuleRowText}
            setStructuredQuerySelection={setStructuredQuerySelection}
            structuredQuerySelection={structuredQuerySelection}
            groupId="top-level"
          />
        )}
        {showAddRuleGroupButton && (
          <AddRuleGroupButton
            addRuleGroupText={mergedMessages.addRuleGroupText}
            setStructuredQuerySelection={setStructuredQuerySelection}
            structuredQuerySelection={structuredQuerySelection}
          />
        )}
      </div>
    </div>
  );
};

export default withErrorBoundary(
  StructuredQuery,
  FallbackComponent('StructuredQuery'),
  onErrorCallback
);
