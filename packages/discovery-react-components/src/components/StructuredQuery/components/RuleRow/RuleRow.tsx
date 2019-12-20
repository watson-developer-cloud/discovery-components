import React, { FC } from 'react';
import { ComboBox, TextInput } from 'carbon-components-react';
import { Messages } from 'components/StructuredQuery/messages';
import { structuredQueryRulesClass } from 'components/StructuredQuery/cssClasses';

export interface RuleRowProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
}

export const RuleRow: FC<RuleRowProps> = ({ messages }) => {
  const operatorDropdownItems = [
    { label: messages.operatorDropdownIsOptionText, value: '::' },
    { label: messages.operatorDropdownIsNotOptionText, value: '::!' },
    { label: messages.operatorDropdownContainsOptionText, value: ':' },
    { label: messages.operatorDropdownDoesNotContainOptionText, value: ':!' }
  ];

  return (
    <div className={structuredQueryRulesClass}>
      <ComboBox
        id="structured-query-rules-field-0"
        // TODO: Items is empty for now as it's a required field and retrieving fields for the dropdown
        // and adding them as items will be addressed in a future issue
        items={[]}
        placeholder={messages.fieldDropdownPlaceholderText}
        titleText={messages.fieldDropdownTitleText}
      />
      <ComboBox
        id="structured-query-rules-operator-0"
        items={operatorDropdownItems}
        placeholder={messages.operatorDropdownPlaceholderText}
        titleText={messages.operatorDropdownTitleText}
      />
      <TextInput
        id="structured-query-rules-value-0"
        labelText={messages.valueInputLabelText}
        placeholder={messages.valueInputPlaceholderText}
      />
    </div>
  );
};
