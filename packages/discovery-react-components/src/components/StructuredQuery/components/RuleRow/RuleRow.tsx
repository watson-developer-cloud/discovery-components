import React, { FC } from 'react';
import { ComboBox, TextInput } from 'carbon-components-react';
import { Button } from 'carbon-components-react';
import SubtractAlt16 from '@carbon/icons-react/lib/subtract--alt/16';
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
   * id of the rule row to render
   */
  rowId: Row['id'];
  /**
   * state that represents the current rules and selections for the structured query
   */
  ruleRows: StructuredQuerySelection;
  /**
   * used to set the ruleRows state
   */
  setRuleRows: (ruleRows: StructuredQuerySelection) => void;
}

export const RuleRow: FC<RuleRowProps> = ({ messages, rowId, ruleRows, setRuleRows }) => {
  const operatorDropdownItems = [
    { label: messages.operatorDropdownIsOptionText, value: '::' },
    { label: messages.operatorDropdownIsNotOptionText, value: '::!' },
    { label: messages.operatorDropdownContainsOptionText, value: ':' },
    { label: messages.operatorDropdownDoesNotContainOptionText, value: ':!' }
  ];
  const showRemoveRuleRowButton = ruleRows.rows.length > 1;

  const handleRemoveRuleRowOnClick = () => {
    setRuleRows(
      Object.assign({}, ruleRows, {
        rows: ruleRows.rows.filter(ruleRow => ruleRow.id !== rowId)
      })
    );
  };

  return (
    <div className={structuredQueryRulesClass}>
      <ComboBox
        id={`structured-query-rules-field-` + rowId}
        // TODO: Items is empty for now as it's a required field and retrieving fields for the dropdown
        // and adding them as items will be addressed in a future issue
        items={[]}
        placeholder={messages.fieldDropdownPlaceholderText}
        titleText={messages.fieldDropdownTitleText}
      />
      <ComboBox
        id={`structured-query-rules-operator-` + rowId}
        items={operatorDropdownItems}
        placeholder={messages.operatorDropdownPlaceholderText}
        titleText={messages.operatorDropdownTitleText}
      />
      <TextInput
        id={`structured-query-rules-value-` + rowId}
        labelText={messages.valueInputLabelText}
        placeholder={messages.valueInputPlaceholderText}
      />
      {showRemoveRuleRowButton && (
        <Button
          hasIconOnly
          kind="ghost"
          renderIcon={SubtractAlt16}
          iconDescription="Remove row"
          onClick={handleRemoveRuleRowOnClick}
          data-testid="remove-rule-row-button"
        />
      )}
    </div>
  );
};
