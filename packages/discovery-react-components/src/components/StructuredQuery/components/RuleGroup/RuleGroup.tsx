import React, { FC, Dispatch, SetStateAction } from 'react';
import { Messages } from 'components/StructuredQuery/messages';
import { RuleGroupDropdown } from '../RuleGroupDropdown/RuleGroupDropdown';
import { RuleRow } from '../RuleRow/RuleRow';
import { AddRuleRowButton } from '../AddRuleRowButton/AddRuleRowButton';
import { StructuredQuerySelection } from 'components/StructuredQuery/utils/structuredQueryInterfaces';
import { MAX_NUM_SIBLING_RULE_ROWS } from 'components/StructuredQuery/constants';
import { structuredQueryRulesButtonsClass } from 'components/StructuredQuery/cssClasses';

export interface RuleGroupProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages?: Partial<Messages>;
  /**
   * id of the group for the rule row to render, if it's not a top-level rule row
   */
  groupId?: number;
  /**
   * state that represents the current rules and selections for the structured query
   */
  groupAndRuleRows: StructuredQuerySelection;
  /**
   * used to set the groupAndRuleRows state
   */
  setGroupAndRuleRows: Dispatch<SetStateAction<StructuredQuerySelection>>;
}

export const RuleGroup: FC<RuleGroupProps> = ({
  messages,
  groupId,
  groupAndRuleRows,
  setGroupAndRuleRows
}) => {
  const rows =
    groupId !== undefined ? groupAndRuleRows.groups[groupId].rows : groupAndRuleRows.rows;
  const isTopLevelGroup = groupId !== undefined ? false : true;
  const showAddRuleRowButton = rows.length < MAX_NUM_SIBLING_RULE_ROWS;

  return (
    <div className={!isTopLevelGroup && 'indent'}>
      <RuleGroupDropdown messages={messages} />
      {rows.map(row => {
        return (
          <RuleRow
            messages={messages}
            groupId={groupId}
            rowId={row.id}
            key={row.id}
            setGroupAndRuleRows={setGroupAndRuleRows}
            groupAndRuleRows={groupAndRuleRows}
          />
        );
      })}
      <div className={structuredQueryRulesButtonsClass}>
        {!isTopLevelGroup && showAddRuleRowButton && (
          <AddRuleRowButton
            addRuleRowText={messages.addRuleRowText}
            key={groupId}
            groupId={groupId}
            setGroupAndRuleRows={setGroupAndRuleRows}
            groupAndRuleRows={groupAndRuleRows}
          />
        )}
      </div>
    </div>
  );
};
