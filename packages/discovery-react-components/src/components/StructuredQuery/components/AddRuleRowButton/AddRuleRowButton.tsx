import React, { FC, Dispatch, SetStateAction } from 'react';
import { Button } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';
import { Messages } from 'components/StructuredQuery/messages';
import { StructuredQuerySelection } from 'components/StructuredQuery/utils/structuredQueryInterfaces';

export interface AddRuleRowButtonProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
  topLevelGroupId?: number;
  groupId: number;
  /**
   * state that represents the current rules and selections for the structured query
   */
  groupAndRuleRows: StructuredQuerySelection[];
  /**
   * used to set the ruleRows state
   */
  setGroupAndRuleRows: Dispatch<SetStateAction<StructuredQuerySelection[]>>;
}

const handleAddRuleRowOnClick = (
  groupAndRuleRows: StructuredQuerySelection[],
  setGroupAndRuleRows: Dispatch<SetStateAction<StructuredQuerySelection[]>>,
  topLevelGroupId: number | undefined,
  groupId: number
) => {
  if (topLevelGroupId !== undefined) {
    const newRuleRowId =
      groupAndRuleRows[topLevelGroupId].groups[groupId].rows[
        groupAndRuleRows[topLevelGroupId].groups[groupId].rows.length - 1
      ].id + 1;
    const newRuleRow = { id: newRuleRowId };
    // TODO: Can get rid of top-level group id since that will always be the same
    setGroupAndRuleRows([
      {
        ...groupAndRuleRows[0],
        groups: groupAndRuleRows[topLevelGroupId].groups.map(group => {
          if (group.id === groupId) {
            return {
              ...groupAndRuleRows[0].groups[groupId],
              rows: groupAndRuleRows[0].groups[groupId].rows.concat(newRuleRow)
            };
          } else {
            return group;
          }
        })
      }
    ]);
  } else {
    const newRuleRowId = groupAndRuleRows[0].rows[groupAndRuleRows[0].rows.length - 1].id + 1;
    const newRuleRow = { id: newRuleRowId };
    setGroupAndRuleRows([
      {
        ...groupAndRuleRows[0],
        rows: groupAndRuleRows[0].rows.concat(newRuleRow)
      }
    ]);
  }
};

// TODO: Only send through the add rule row text and not all of the messages?
export const AddRuleRowButton: FC<AddRuleRowButtonProps> = ({
  messages,
  topLevelGroupId,
  groupId,
  groupAndRuleRows,
  setGroupAndRuleRows
}) => {
  return (
    <Button
      kind="ghost"
      renderIcon={Add16}
      onClick={() =>
        handleAddRuleRowOnClick(groupAndRuleRows, setGroupAndRuleRows, topLevelGroupId, groupId)
      }
    >
      {messages.addRuleRowText}
    </Button>
  );
};
