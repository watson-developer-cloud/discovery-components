import React, { FC, useState } from 'react';
import { RuleGroup } from './components/RuleGroup/RuleGroup';
import { AddRuleRowButton } from './components/AddRuleRowButton/AddRuleRowButton';
import { AddRuleGroupButton } from './components/AddRuleGroupButton/AddRuleGroupButton';
import { defaultMessages, Messages } from './messages';
import { structuredQueryClass, structuredQueryRulesButtonsClass } from './cssClasses';
import { MAX_NUM_SIBLING_RULE_ROWS, MAX_NUM_NESTED_RULE_GROUPS } from './constants';
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
    groups: {
      0: { rows: [0] }
    },
    group_order: [0]
  });

  const showAddRuleRowButton =
    structuredQuerySelection.groups[0].rows.length < MAX_NUM_SIBLING_RULE_ROWS;
  const showAddRuleGroupButton =
    Object.keys(structuredQuerySelection.groups).length - 1 < MAX_NUM_NESTED_RULE_GROUPS;

  return (
    <div className={structuredQueryClass}>
      {structuredQuerySelection.group_order.map(id => {
        return (
          <RuleGroup
            messages={mergedMessages}
            groupId={id}
            key={id}
            structuredQuerySelection={structuredQuerySelection}
            setStructuredQuerySelection={setStructuredQuerySelection}
          />
        );
      })}
      <div className={structuredQueryRulesButtonsClass}>
        {showAddRuleRowButton && (
          <AddRuleRowButton
            addRuleRowText={mergedMessages.addRuleRowText}
            setStructuredQuerySelection={setStructuredQuerySelection}
            structuredQuerySelection={structuredQuerySelection}
            groupId={0}
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
