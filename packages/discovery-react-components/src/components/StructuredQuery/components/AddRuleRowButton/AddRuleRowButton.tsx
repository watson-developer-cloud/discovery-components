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
  groupId: number;
  /**
   * state that represents the current rules and selections for the structured query
   */
  structuredQuerySelection: StructuredQuerySelection;
  /**
   * used to set the structuredQuerySelection state
   */
  setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
}

export const AddRuleRowButton: FC<AddRuleRowButtonProps> = ({
  addRuleRowText,
  groupId,
  structuredQuerySelection,
  setStructuredQuerySelection
}) => {
  const handleOnClick = (
    structuredQuerySelection: StructuredQuerySelection,
    setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>,
    groupId: number
  ) => {
    const newRuleRowId =
      structuredQuerySelection.groups[groupId].rows[
        structuredQuerySelection.groups[groupId].rows.length - 1
      ] + 1;
    setStructuredQuerySelection({
      groups: {
        ...structuredQuerySelection.groups,
        [`${groupId}`]: {
          ...structuredQuerySelection.groups[groupId],
          rows: structuredQuerySelection.groups[groupId].rows.concat(newRuleRowId)
        }
      }
    });
  };

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
