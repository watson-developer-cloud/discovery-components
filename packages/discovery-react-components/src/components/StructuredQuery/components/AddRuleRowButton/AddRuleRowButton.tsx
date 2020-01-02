import React, { FC, Dispatch, SetStateAction } from 'react';
import { Button } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';
import { Messages } from 'components/StructuredQuery/messages';
import { StructuredQuerySelection } from 'components/StructuredQuery/utils/structuredQueryInterfaces';

export interface AddRuleRowButtonProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  addRuleRowText: Messages['addRuleRowText'];
  /**
   * id of the group for the rule row to add, if it's not a top-level rule row
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

const handleOnClick = (
  groupAndRuleRows: StructuredQuerySelection,
  setGroupAndRuleRows: Dispatch<SetStateAction<StructuredQuerySelection>>,
  groupId: number | undefined
) => {
  if (groupId !== undefined) {
    const newRuleRowId =
      groupAndRuleRows.groups[groupId].rows[groupAndRuleRows.groups[groupId].rows.length - 1].id +
      1;
    const newRuleRow = { id: newRuleRowId };
    setGroupAndRuleRows({
      ...groupAndRuleRows,
      groups: groupAndRuleRows.groups.map(group => {
        if (group.id === groupId) {
          return {
            ...groupAndRuleRows.groups[groupId],
            rows: groupAndRuleRows.groups[groupId].rows.concat(newRuleRow)
          };
        } else {
          return group;
        }
      })
    });
  } else {
    const newRuleRowId = groupAndRuleRows.rows[groupAndRuleRows.rows.length - 1].id + 1;
    const newRuleRow = { id: newRuleRowId };
    setGroupAndRuleRows({
      ...groupAndRuleRows,
      rows: groupAndRuleRows.rows.concat(newRuleRow)
    });
  }
};

export const AddRuleRowButton: FC<AddRuleRowButtonProps> = ({
  addRuleRowText,
  groupId,
  groupAndRuleRows,
  setGroupAndRuleRows
}) => {
  return (
    <Button
      kind="ghost"
      renderIcon={Add16}
      onClick={() => handleOnClick(groupAndRuleRows, setGroupAndRuleRows, groupId)}
    >
      {addRuleRowText}
    </Button>
  );
};
