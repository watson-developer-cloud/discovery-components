import React, { FC } from 'react';
import { ComboBox, TextInput } from 'carbon-components-react';
import { Button } from 'carbon-components-react';
import SubtractAlt16 from '@carbon/icons-react/lib/subtract--alt/16';
import { Messages } from 'components/StructuredQuery/messages';
import { structuredQueryRulesClass } from 'components/StructuredQuery/cssClasses';

export interface Row {
  id: number;
}

export interface StructuredQuerySelection {
  rows: Row[];
}

export interface RuleRowProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
  row: Row;
  showRemoveButton: boolean;
  setRuleRows: (ruleRows: StructuredQuerySelection) => void;
  ruleRows: StructuredQuerySelection;
}

export const RuleRow: FC<RuleRowProps> = ({
  messages,
  row,
  showRemoveButton,
  setRuleRows,
  ruleRows
}) => {
  const operatorDropdownItems = [
    { label: messages.operatorDropdownIsOptionText, value: '::' },
    { label: messages.operatorDropdownIsNotOptionText, value: '::!' },
    { label: messages.operatorDropdownContainsOptionText, value: ':' },
    { label: messages.operatorDropdownDoesNotContainOptionText, value: ':!' }
  ];

  const handleRemoveButtonOnClick = () => {
    setRuleRows(
      Object.assign({}, ruleRows, {
        rows: ruleRows.rows.filter(ruleRow => ruleRow.id !== row.id)
      })
    );
  };

  return (
    <div className={structuredQueryRulesClass}>
      <ComboBox
        id={`structured-query-rules-field-` + row.id}
        // TODO: Items is empty for now as it's a required field and retrieving fields for the dropdown
        // and adding them as items will be addressed in a future issue
        items={[]}
        placeholder={messages.fieldDropdownPlaceholderText}
        titleText={messages.fieldDropdownTitleText}
      />
      <ComboBox
        id={`structured-query-rules-operator-` + row.id}
        items={operatorDropdownItems}
        placeholder={messages.operatorDropdownPlaceholderText}
        titleText={messages.operatorDropdownTitleText}
      />
      <TextInput
        id={`structured-query-rules-value-` + row.id}
        labelText={messages.valueInputLabelText}
        placeholder={messages.valueInputPlaceholderText}
      />
      {showRemoveButton && (
        <Button
          hasIconOnly
          renderIcon={SubtractAlt16}
          iconDescription="Remove row"
          onClick={handleRemoveButtonOnClick}
        />
      )}
    </div>
  );
};
