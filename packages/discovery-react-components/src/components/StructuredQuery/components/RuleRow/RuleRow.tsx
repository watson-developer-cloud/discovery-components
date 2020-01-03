import React, { FC, Dispatch, SetStateAction } from 'react';
import { ComboBox, TextInput } from 'carbon-components-react';
import { RemoveRuleRowButton } from '../RemoveRuleRowButton/RemoveRuleRowButton';
import { Messages } from 'components/StructuredQuery/messages';
import { structuredQueryRulesClass } from 'components/StructuredQuery/cssClasses';
import {
  Row,
  StructuredQuerySelection
} from 'components/StructuredQuery/utils/structuredQueryInterfaces';

export interface RuleRowProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
  /**
   * id of the group for the rule row to render, if it's not a top-level rule row
   */
  groupId?: number;
  /**
   * id of the rule row to render
   */
  rowId: Row['id'];
  /**
   * state that represents the current rules and selections for the structured query
   */
  groupAndRuleRows: StructuredQuerySelection;
  /**
   * used to set the groupAndRuleRows state
   */
  setGroupAndRuleRows: Dispatch<SetStateAction<StructuredQuerySelection>>;
}

export const RuleRow: FC<RuleRowProps> = ({
  messages,
  groupId,
  rowId,
  groupAndRuleRows,
  setGroupAndRuleRows
}) => {
  const operatorDropdownItems = [
    { label: messages.operatorDropdownIsOptionText, value: '::' },
    { label: messages.operatorDropdownIsNotOptionText, value: '::!' },
    { label: messages.operatorDropdownContainsOptionText, value: ':' },
    { label: messages.operatorDropdownDoesNotContainOptionText, value: ':!' }
  ];
  let rowsLength: number = groupAndRuleRows.rows.length;
  if (groupId !== undefined) {
    groupAndRuleRows.groups.map(group => {
      if (group.id === groupId) {
        rowsLength = group.rows.length;
      }
    });
  }

  const showRemoveRuleRowButton = groupId !== undefined ? rowsLength > 0 : rowsLength > 1;

  return (
    <div className={structuredQueryRulesClass} data-testid={`rule-row-${groupId}`}>
      <ComboBox
        id={`structured-query-rules-field-${rowId}`}
        // TODO: Items is empty for now as it's a required field and retrieving fields for the dropdown
        // and adding them as items will be addressed in a future issue
        items={[]}
        placeholder={messages.fieldDropdownPlaceholderText}
        titleText={messages.fieldDropdownTitleText}
      />
      <ComboBox
        id={`structured-query-rules-operator-${rowId}`}
        items={operatorDropdownItems}
        placeholder={messages.operatorDropdownPlaceholderText}
        titleText={messages.operatorDropdownTitleText}
      />
      <TextInput
        id={`structured-query-rules-value-${rowId}`}
        labelText={messages.valueInputLabelText}
        placeholder={messages.valueInputPlaceholderText}
      />
      {showRemoveRuleRowButton && (
        <RemoveRuleRowButton
          removeRuleRowButtonIconDescription={messages.removeRuleRowButtonIconDescription}
          groupId={groupId}
          rowId={rowId}
          groupAndRuleRows={groupAndRuleRows}
          setGroupAndRuleRows={setGroupAndRuleRows}
        />
      )}
    </div>
  );
};
