import React, { FC, Dispatch, SetStateAction } from 'react';
import keys from 'lodash/keys';
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
    const maxGroupId = keys(structuredQuerySelection.groups).reduce(function(a, b) {
      return Math.max(parseInt(a), parseInt(b)).toString();
    });
    const newRuleGroupId: number = parseInt(maxGroupId) + 1;
    setStructuredQuerySelection({
      groups: {
        ...structuredQuerySelection.groups,
        [`${newRuleGroupId}`]: {
          rows: [0]
        }
      }
    });
  };

  return (
    <Button kind="ghost" renderIcon={Add16} onClick={handleOnClick}>
      {addRuleGroupText}
    </Button>
  );
};
