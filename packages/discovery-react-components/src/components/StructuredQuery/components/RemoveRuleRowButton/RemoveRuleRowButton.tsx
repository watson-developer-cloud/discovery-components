import React, { FC, Dispatch, SetStateAction } from 'react';
import { Button } from 'carbon-components-react';
import SubtractAlt16 from '@carbon/icons-react/lib/subtract--alt/16';
import { Messages } from 'components/StructuredQuery/messages';
import {
  StructuredQuerySelection,
  Row
} from 'components/StructuredQuery/utils/structuredQueryInterfaces';

export interface RemoveRuleRowButtonProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  removeRuleRowButtonIconDescription: Messages['removeRuleRowButtonIconDescription'];
  /**
   * id of the group for the rule row to remove, if it's not a top-level rule row
   */
  groupId?: number;
  /**
   * id of the rule row to remove
   */
  rowId: Row['id'];
  /**
   * state that represents the current rules and selections for the structured query
   */
  groupAndRuleRows: StructuredQuerySelection;
  /**
   * used to set the groupAndRuleRows state
   */
  setGroupAndRuleRows: Dispatch<SetStateAction<StructuredQuerySelection>>;
}

export const RemoveRuleRowButton: FC<RemoveRuleRowButtonProps> = ({
  removeRuleRowButtonIconDescription,
  groupId,
  rowId,
  groupAndRuleRows,
  setGroupAndRuleRows
}) => {
  const handleOnClick = () => {
    if (groupId !== undefined) {
      setGroupAndRuleRows({
        ...groupAndRuleRows,
        groups: groupAndRuleRows.groups
          .map(group => {
            if (group.id === groupId) {
              return {
                ...groupAndRuleRows.groups[groupId],
                rows: groupAndRuleRows.groups[groupId].rows.filter(
                  (ruleRow: Row) => ruleRow.id !== rowId
                )
              };
            } else {
              return group;
            }
          })
          .filter(group => group.rows.length > 0)
      });
    } else {
      setGroupAndRuleRows({
        ...groupAndRuleRows,
        rows: groupAndRuleRows.rows.filter((ruleRow: Row) => ruleRow.id !== rowId)
      });
    }
  };

  return (
    <Button
      hasIconOnly
      kind="ghost"
      renderIcon={SubtractAlt16}
      iconDescription={removeRuleRowButtonIconDescription}
      onClick={handleOnClick}
      data-testid="remove-rule-row-button"
    />
  );
};
