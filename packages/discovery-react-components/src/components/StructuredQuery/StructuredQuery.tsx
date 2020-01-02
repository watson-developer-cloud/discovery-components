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
  // SO it's just rows and then groups that can have rows, so can remove top-level id and array
  const [groupAndRuleRows, setGroupAndRuleRows] = useState<StructuredQuerySelection[]>([
    { id: 0, rows: [{ id: 0 }], groups: [] }
  ]);
  const showAddRuleRowButton = groupAndRuleRows[0].rows.length < MAX_NUM_SIBLING_RULE_ROWS;

  const handleAddRuleGroupOnClick = () => {
    const newRuleGroupId =
      groupAndRuleRows[0].groups.length !== 0
        ? groupAndRuleRows[0].groups[groupAndRuleRows[0].groups.length - 1].id! + 1
        : 0;
    const newRuleGroup: Group = { id: newRuleGroupId, rows: [{ id: 0 }] };
    setGroupAndRuleRows([
      {
        ...groupAndRuleRows[0],
        groups: groupAndRuleRows[0].groups.concat(newRuleGroup)
      }
    ]);
  };

  return (
    <div className={structuredQueryClass}>
      {groupAndRuleRows.map(topLevelGroup => {
        return (
          <>
            <RuleGroupDropdown messages={mergedMessages} />
            {topLevelGroup.rows.map(row => {
              return (
                <RuleRow
                  messages={mergedMessages}
                  groupId={topLevelGroup.id}
                  rowId={row.id}
                  key={row.id}
                  setGroupAndRuleRows={setGroupAndRuleRows}
                  groupAndRuleRows={groupAndRuleRows}
                />
              );
            })}
            {topLevelGroup.groups.map(group => {
              const showAddRuleRowButton2 = group.rows.length < MAX_NUM_SIBLING_RULE_ROWS;
              return (
                <div className="indent">
                  <RuleGroupDropdown messages={mergedMessages} />
                  {group.rows.map(row => {
                    return (
                      <RuleRow
                        messages={mergedMessages}
                        topLevelGroupId={topLevelGroup.id}
                        groupId={group.id}
                        rowId={row.id}
                        key={row.id}
                        setGroupAndRuleRows={setGroupAndRuleRows}
                        groupAndRuleRows={groupAndRuleRows}
                      />
                    );
                  })}
                  <div className={structuredQueryRulesButtonsClass}>
                    {showAddRuleRowButton2 && (
                      <AddRuleRowButton
                        messages={mergedMessages}
                        topLevelGroupId={topLevelGroup.id}
                        key={topLevelGroup.id + group.id}
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
                  groupId={topLevelGroup.id}
                  setGroupAndRuleRows={setGroupAndRuleRows}
                  groupAndRuleRows={groupAndRuleRows}
                />
              )}
              <Button kind="ghost" renderIcon={Add16} onClick={handleAddRuleGroupOnClick}>
                {mergedMessages.addRuleGroupText}
              </Button>
            </div>
          </>
        );
      })}
    </div>
  );
};
