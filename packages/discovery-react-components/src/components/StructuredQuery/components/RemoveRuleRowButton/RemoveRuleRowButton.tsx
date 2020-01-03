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
   * text to display for the Remove rule button icon description
   */
  removeRuleRowButtonIconDescription: Messages['removeRuleRowButtonIconDescription'];
  /**
   * id of the group for the rule row to remove, if it's not a top-level rule row
   */
  groupId: number | 'top-level';
  /**
   * id of the rule row to remove
   */
  rowId: Row['id'];
  /**
   * state that represents the current rules and selections for the structured query
   */
  structuredQuerySelection: StructuredQuerySelection;
  /**
   * used to set the groupAndRuleRows state
   */
  setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
}

export const RemoveRuleRowButton: FC<RemoveRuleRowButtonProps> = ({
  removeRuleRowButtonIconDescription,
  groupId,
  rowId,
  structuredQuerySelection,
  setStructuredQuerySelection
}) => {
  const handleOnClick = () => {
    if (groupId === 'top-level') {
      setStructuredQuerySelection({
        ...structuredQuerySelection,
        rows: structuredQuerySelection.rows.filter((ruleRow: Row) => ruleRow.id !== rowId)
      });
    } else {
      setStructuredQuerySelection({
        ...structuredQuerySelection,
        groups: structuredQuerySelection.groups
          .map((group, i) => {
            if (group.id === groupId) {
              return {
                ...structuredQuerySelection.groups[i],
                rows: structuredQuerySelection.groups[i].rows.filter(
                  (ruleRow: Row) => ruleRow.id !== rowId
                )
              };
            } else {
              return group;
            }
          })
          .filter(group => group.rows.length > 0)
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
