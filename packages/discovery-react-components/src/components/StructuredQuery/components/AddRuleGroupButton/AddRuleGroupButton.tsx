import React, { FC, Dispatch, SetStateAction } from 'react';
import { Button } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';
import { Messages } from 'components/StructuredQuery/messages';
import { StructuredQuerySelection } from 'components/StructuredQuery/utils/structuredQueryInterfaces';

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
    const maxGroupId = Object.keys(structuredQuerySelection.groups).reduce(
      (previousId, currentId) => Math.max(parseInt(previousId), parseInt(currentId)).toString()
    );
    const newRuleGroupId: number = parseInt(maxGroupId) + 1;
    setStructuredQuerySelection({
      groups: {
        ...structuredQuerySelection.groups,
        [`${newRuleGroupId}`]: {
          rows: [0]
        }
      },
      group_order: structuredQuerySelection.group_order.concat(newRuleGroupId)
    });
  };

  return (
    <Button kind="ghost" renderIcon={Add16} onClick={handleOnClick}>
      {addRuleGroupText}
    </Button>
  );
};
