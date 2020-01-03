import React, { FC, Dispatch, SetStateAction } from 'react';
import { Messages } from 'components/StructuredQuery/messages';
import { RuleGroupDropdown } from '../RuleGroupDropdown/RuleGroupDropdown';
import { RuleRow } from '../RuleRow/RuleRow';
import { AddRuleRowButton } from '../AddRuleRowButton/AddRuleRowButton';
import {
  StructuredQuerySelection,
  Row
} from 'components/StructuredQuery/utils/structuredQueryInterfaces';
import { MAX_NUM_SIBLING_RULE_ROWS } from 'components/StructuredQuery/constants';
import {
  structuredQueryRuleGroupClass,
  structuredQueryNestedRuleGroupClass,
  structuredQueryRulesButtonsClass
} from 'components/StructuredQuery/cssClasses';

export interface RuleGroupProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
  /**
   * id of the group for the rule row to render, or 'top-level' if the top-level rule group
   */
  groupId: number | 'top-level';
  /**
   * state that represents the current rules and selections for the structured query
   */
  structuredQuerySelection: StructuredQuerySelection;
  /**
   * used to set the groupAndRuleRows state
   */
  setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
}

export const RuleGroup: FC<RuleGroupProps> = ({
  messages,
  groupId,
  structuredQuerySelection,
  setStructuredQuerySelection
}) => {
  const isTopLevelGroup = groupId === 'top-level';
  let rows: Row[] = structuredQuerySelection.rows;
  if (!isTopLevelGroup) {
    structuredQuerySelection.groups.map(group => {
      if (group.id === groupId) {
        rows = group.rows;
      }
    });
  }
  const showAddRuleRowButton = rows.length < MAX_NUM_SIBLING_RULE_ROWS && !isTopLevelGroup;
  const ruleGroupClassNames = [structuredQueryRuleGroupClass];
  if (!isTopLevelGroup) {
    ruleGroupClassNames.push(structuredQueryNestedRuleGroupClass);
  }

  return (
    <div className={ruleGroupClassNames.join(' ')} data-testid="structured-query__rule-group">
      <RuleGroupDropdown messages={messages} />
      {rows.map(row => {
        return (
          <RuleRow
            messages={messages}
            groupId={groupId}
            rowId={row.id}
            key={row.id}
            setStructuredQuerySelection={setStructuredQuerySelection}
            structuredQuerySelection={structuredQuerySelection}
          />
        );
      })}
      <div className={structuredQueryRulesButtonsClass}>
        {showAddRuleRowButton && (
          <AddRuleRowButton
            addRuleRowText={messages.addRuleRowText}
            key={groupId}
            groupId={groupId}
            setStructuredQuerySelection={setStructuredQuerySelection}
            structuredQuerySelection={structuredQuerySelection}
          />
        )}
      </div>
    </div>
  );
};
