import React, { FC, useState } from 'react';
import { RuleGroup } from './components/RuleGroup/RuleGroup';
import { AddRuleRowButton } from './components/AddRuleRowButton/AddRuleRowButton';
import { AddRuleGroupButton } from './components/AddRuleGroupButton/AddRuleGroupButton';
import { defaultMessages, Messages } from './messages';
import { structuredQueryClass, structuredQueryRulesButtonsClass } from './cssClasses';
import { MAX_NUM_SIBLING_RULE_ROWS } from './constants';
import { StructuredQuerySelection } from './utils/structuredQueryInterfaces';

export interface StructuredQueryProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages?: Partial<Messages>;
}

export const StructuredQuery: FC<StructuredQueryProps> = ({ messages = defaultMessages }) => {
  const mergedMessages = { ...defaultMessages, ...messages };
  const [groupAndRuleRows, setGroupAndRuleRows] = useState<StructuredQuerySelection>({
    rows: [{ id: 0 }],
    groups: []
  });
  const showAddRuleRowButton = groupAndRuleRows.rows.length < MAX_NUM_SIBLING_RULE_ROWS;

  return (
    <div className={structuredQueryClass}>
      <RuleGroup
        messages={mergedMessages}
        groupAndRuleRows={groupAndRuleRows}
        setGroupAndRuleRows={setGroupAndRuleRows}
      />
      {groupAndRuleRows.groups.map(group => {
        return (
          <RuleGroup
            messages={mergedMessages}
            groupId={group.id}
            groupAndRuleRows={groupAndRuleRows}
            setGroupAndRuleRows={setGroupAndRuleRows}
          />
        );
      })}
      <div className={structuredQueryRulesButtonsClass}>
        {showAddRuleRowButton && (
          <AddRuleRowButton
            addRuleRowText={mergedMessages.addRuleRowText}
            setGroupAndRuleRows={setGroupAndRuleRows}
            groupAndRuleRows={groupAndRuleRows}
          />
        )}
        <AddRuleGroupButton
          addRuleGroupText={mergedMessages.addRuleGroupText}
          setGroupAndRuleRows={setGroupAndRuleRows}
          groupAndRuleRows={groupAndRuleRows}
        />
      </div>
    </div>
  );
};
