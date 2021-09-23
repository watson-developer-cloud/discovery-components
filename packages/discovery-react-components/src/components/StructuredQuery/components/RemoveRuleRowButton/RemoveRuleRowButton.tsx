import React, { FC, Dispatch, SetStateAction } from 'react';
import omit from 'lodash/omit';
import { Button } from 'carbon-components-react';
import { SubtractAlt16 } from '@carbon/icons-react';
import { Messages } from 'components/StructuredQuery/messages';
import { StructuredQuerySelection } from 'components/StructuredQuery/utils/structuredQueryInterfaces';

export interface RemoveRuleRowButtonProps {
  /**
   * text to display for the Remove rule button icon description
   */
  removeRuleRowButtonIconDescription: Messages['removeRuleRowButtonIconDescription'];
  /**
   * id of the group for the rule row to render
   */
  groupId: number;
  /**
   * id of the rule row to remove
   */
  rowId: number;
  /**
   * state that represents the current rules and selections for the structured query
   */
  structuredQuerySelection: StructuredQuerySelection;
  /**
   * used to set the structuredQuerySelection state
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
    const filteredGroupRows = structuredQuerySelection.groups[groupId].rows.filter(
      (row: number) => row !== rowId
    );
    const filteredRows = omit(structuredQuerySelection.rows, rowId);
    const isLastRuleInRuleGroup = filteredGroupRows.length === 0;
    if (isLastRuleInRuleGroup) {
      setStructuredQuerySelection({
        ...structuredQuerySelection,
        groups: {
          ...omit(structuredQuerySelection.groups, groupId)
        },
        rows: {
          ...filteredRows
        },
        group_order: structuredQuerySelection.group_order.filter(id => id !== groupId)
      });
    } else {
      setStructuredQuerySelection({
        ...structuredQuerySelection,
        groups: {
          ...structuredQuerySelection.groups,
          [`${groupId}`]: {
            ...structuredQuerySelection.groups[groupId],
            rows: filteredGroupRows
          }
        },
        rows: {
          ...filteredRows
        }
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
      data-testid={`remove-rule-row-button-${groupId}`}
    />
  );
};
