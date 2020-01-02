import React, { FC, Dispatch, SetStateAction } from 'react';
import { Button } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';
import { Messages } from 'components/StructuredQuery/messages';
import {
  Group,
  StructuredQuerySelection
} from 'components/StructuredQuery/utils/structuredQueryInterfaces';

export interface AddRuleGroupButtonProps {
  addRuleGroupText: Messages['addRuleGroupText'];
  /**
   * state that represents the current rules and selections for the structured query
   */
  groupAndRuleRows: StructuredQuerySelection;
  /**
   * used to set the groupAndRuleRows state
   */
  setGroupAndRuleRows: Dispatch<SetStateAction<StructuredQuerySelection>>;
}

export const AddRuleGroupButton: FC<AddRuleGroupButtonProps> = ({
  addRuleGroupText,
  groupAndRuleRows,
  setGroupAndRuleRows
}) => {
  const handleOnClick = () => {
    const newRuleGroupId =
      groupAndRuleRows.groups.length !== 0
        ? groupAndRuleRows.groups[groupAndRuleRows.groups.length - 1].id! + 1
        : 0;
    const newRuleGroup: Group = { id: newRuleGroupId, rows: [{ id: 0 }] };
    setGroupAndRuleRows({
      ...groupAndRuleRows,
      groups: groupAndRuleRows.groups.concat(newRuleGroup)
    });
  };

  return (
    <Button kind="ghost" renderIcon={Add16} onClick={handleOnClick}>
      {addRuleGroupText}
    </Button>
  );
};
