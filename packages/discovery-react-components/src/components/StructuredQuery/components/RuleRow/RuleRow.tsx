import * as React from 'react';
import { ComboBox, TextInput } from 'carbon-components-react';
import { Messages } from 'components/StructuredQuery/messages';
import {
  structuredQueryRulesClass,
  structuredQueryRulesOperatorDropdownClass
} from 'components/StructuredQuery/cssClasses';

export interface RuleRowProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
}

export const RuleRow: React.FunctionComponent<RuleRowProps> = ({ messages }) => {
  const handleOnChange = () => {
    // TODO: Fully implement handling dropdown selections in a future issue
  };

  return (
    <div className={structuredQueryRulesClass}>
      <ComboBox
        id="structured-query-rules-field-0"
        // TODO: Items is empty for now as it's a required field and retrieving fields for the dropdown
        // and adding them as items will be addressed in a future issue
        items={[]}
        placeholder={messages.fieldDropdownPlaceholderText}
        titleText={messages.fieldDropdownTitleText}
        onChange={handleOnChange}
      />
      <ComboBox
        id="structured-query-rules-operator-0"
        className={structuredQueryRulesOperatorDropdownClass}
        items={[
          messages.operatorDropdownIsOptionText,
          messages.operatorDropdownIsNotOptionText,
          messages.operatorDropdownContainsOptionText,
          messages.operatorDropdownDoesNotContainOptionText
        ]}
        placeholder={messages.operatorDropdownPlaceholderText}
        titleText={messages.operatorDropdownTitleText}
        onChange={handleOnChange}
      />
      <TextInput
        id="structured-query-rules-value-0"
        labelText={messages.valueInputLabelText}
        placeholder={messages.valueInputPlaceholderText}
      />
    </div>
  );
};
