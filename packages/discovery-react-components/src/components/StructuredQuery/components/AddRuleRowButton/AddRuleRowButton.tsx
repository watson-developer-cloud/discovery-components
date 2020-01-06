import React, { FC, Dispatch, SetStateAction } from 'react';
import { Button } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';
import { Messages } from 'components/StructuredQuery/messages';
import { StructuredQuerySelection } from 'components/StructuredQuery/utils/structuredQueryInterfaces';

export interface AddRuleRowButtonProps {
  /**
   * text to display for the Add rule button
   */
  addRuleRowText: Messages['addRuleRowText'];
  /**
   * id of the group for the rule row to render, or 'top-level' if the top-level rule group
   */
  groupId: number | 'top-level';
  /**
   * state that represents the current rules and selections for the structured query
   */
  structuredQuerySelection: StructuredQuerySelection;
  /**
   * used to set the structuredQuerySelection state
   */
  setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
}

const handleOnClick = (
  structuredQuerySelection: StructuredQuerySelection,
  setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>,
  groupId: number | 'top-level'
) => {
  if (groupId === 'top-level') {
    const newRuleRowId =
      structuredQuerySelection.rows[structuredQuerySelection.rows.length - 1].id + 1;
    const newRuleRow = { id: newRuleRowId };
    setStructuredQuerySelection({
      ...structuredQuerySelection,
      rows: structuredQuerySelection.rows.concat(newRuleRow)
    });
  } else {
    const newRuleRowId =
      structuredQuerySelection.groups[groupId].rows[
        structuredQuerySelection.groups[groupId].rows.length - 1
      ].id + 1;
    const newRuleRow = { id: newRuleRowId };
    setStructuredQuerySelection({
      ...structuredQuerySelection,
      groups: structuredQuerySelection.groups.map(group => {
        if (group.id === groupId) {
          return {
            ...structuredQuerySelection.groups[groupId],
            rows: structuredQuerySelection.groups[groupId].rows.concat(newRuleRow)
          };
        } else {
          return group;
        }
      })
    });
  }
};

export const AddRuleRowButton: FC<AddRuleRowButtonProps> = ({
  addRuleRowText,
  groupId,
  structuredQuerySelection,
  setStructuredQuerySelection
}) => {
  return (
    <Button
      kind="ghost"
      renderIcon={Add16}
      onClick={() => handleOnClick(structuredQuerySelection, setStructuredQuerySelection, groupId)}
    >
      {addRuleRowText}
    </Button>
  );
};
