import React, { FC, Dispatch, SetStateAction } from 'react';
import { Button } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';
import { Messages } from 'components/StructuredQuery/messages';
import {
  Group,
  StructuredQuerySelection
} from 'components/StructuredQuery/utils/structuredQueryInterfaces';

export interface AddRuleGroupButtonProps {
  /**
   * text to display for the Add rule group button
   */
  addRuleGroupText: Messages['addRuleGroupText'];
  /**
   * state that represents the current rules and selections for the structured query
   */
  structuredQuerySelection: StructuredQuerySelection;
  /**
   * used to set the structuredQuerySelection state
   */
  setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
}

export const AddRuleGroupButton: FC<AddRuleGroupButtonProps> = ({
  addRuleGroupText,
  structuredQuerySelection,
  setStructuredQuerySelection
}) => {
  const handleOnClick = () => {
    const newRuleGroupId: Group['id'] =
      structuredQuerySelection.groups.length !== 0
        ? structuredQuerySelection.groups[structuredQuerySelection.groups.length - 1].id! + 1
        : 0;
    const newRuleGroup: Group = { id: newRuleGroupId, rows: [{ id: 0 }] };
    setStructuredQuerySelection({
      ...structuredQuerySelection,
      groups: structuredQuerySelection.groups.concat(newRuleGroup)
    });
  };

  return (
    <Button kind="ghost" renderIcon={Add16} onClick={handleOnClick}>
      {addRuleGroupText}
    </Button>
  );
};
