import React, { FC, Dispatch, SetStateAction } from 'react';
import { Button } from 'carbon-components-react';
import { Add16 } from '@carbon/icons-react';
import { Messages } from 'components/StructuredQuery/messages';
import { StructuredQuerySelection } from 'components/StructuredQuery/utils/structuredQueryInterfaces';
import { getNewId } from 'components/StructuredQuery/utils';

export interface AddRuleRowButtonProps {
  /**
   * text to display for the Add rule button
   */
  addRuleRowText: Messages['addRuleRowText'];
  /**
   * id of the group for the rule row to render
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
  const handleOnClick = () => {
    const newRuleRowId = getNewId(structuredQuerySelection.rows);
    setStructuredQuerySelection({
      ...structuredQuerySelection,
      groups: {
        ...structuredQuerySelection.groups,
        [`${groupId}`]: {
          ...structuredQuerySelection.groups[groupId],
          rows: structuredQuerySelection.groups[groupId].rows.concat(newRuleRowId)
        }
      },
      rows: {
        ...structuredQuerySelection.rows,
        [`${newRuleRowId}`]: {
          field: '',
          operator: '',
          value: ''
        }
      }
    });
  };

  return (
    <Button kind="ghost" renderIcon={Add16} onClick={handleOnClick}>
      {addRuleRowText}
    </Button>
  );
};
