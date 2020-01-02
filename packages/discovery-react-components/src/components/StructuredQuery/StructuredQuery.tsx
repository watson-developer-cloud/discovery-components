import React, { FC, useState } from 'react';
import { Button } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';
import { RuleGroupDropdown } from './components/RuleGroupDropdown/RuleGroupDropdown';
import { RuleRow } from './components/RuleRow/RuleRow';
import { AddRuleRowButton } from './components/AddRuleRowButton/AddRuleRowButton';
import { defaultMessages, Messages } from './messages';
import { structuredQueryClass, structuredQueryRulesButtonsClass } from './cssClasses';
import { MAX_NUM_SIBLING_RULE_ROWS } from './constants';
import { Group, StructuredQuerySelection } from './utils/structuredQueryInterfaces';

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

  const handleAddRuleGroupOnClick = () => {
    const newRuleGroupId =
      groupAndRuleRows.groups.length !== 0
        ? groupAndRuleRows.groups[groupAndRuleRows.groups.length - 1].id! + 1
        : 0;
    const newRuleGroup: Group = { id: newRuleGroupId, rows: [{ id: 0 }] };
    setGroupAndRuleRows({
      ...groupAndRuleRows,
      groups: groupAndRuleRows.groups.concat(newRuleGroup)
    });
  };

  return (
    <div className={structuredQueryClass}>
      <RuleGroupDropdown messages={mergedMessages} />
      {groupAndRuleRows.rows.map(row => {
        return (
          <RuleRow
            messages={mergedMessages}
            rowId={row.id}
            key={row.id}
            setGroupAndRuleRows={setGroupAndRuleRows}
            groupAndRuleRows={groupAndRuleRows}
          />
        );
      })}
      {groupAndRuleRows.groups.map(group => {
        const showAddRuleRowButtonForGroup = group.rows.length < MAX_NUM_SIBLING_RULE_ROWS;
        return (
          <div className="indent">
            <RuleGroupDropdown messages={mergedMessages} />
            {group.rows.map(row => {
              return (
                <RuleRow
                  messages={mergedMessages}
                  groupId={group.id}
                  rowId={row.id}
                  key={row.id}
                  setGroupAndRuleRows={setGroupAndRuleRows}
                  groupAndRuleRows={groupAndRuleRows}
                />
              );
            })}
            <div className={structuredQueryRulesButtonsClass}>
              {showAddRuleRowButtonForGroup && (
                <AddRuleRowButton
                  messages={mergedMessages}
                  key={group.id}
                  groupId={group.id}
                  setGroupAndRuleRows={setGroupAndRuleRows}
                  groupAndRuleRows={groupAndRuleRows}
                />
              )}
            </div>
          </div>
        );
      })}
      <div className={structuredQueryRulesButtonsClass}>
        {showAddRuleRowButton && (
          <AddRuleRowButton
            messages={mergedMessages}
            setGroupAndRuleRows={setGroupAndRuleRows}
            groupAndRuleRows={groupAndRuleRows}
          />
        )}
        <Button kind="ghost" renderIcon={Add16} onClick={handleAddRuleGroupOnClick}>
          {mergedMessages.addRuleGroupText}
        </Button>
      </div>
    </div>
  );
};
