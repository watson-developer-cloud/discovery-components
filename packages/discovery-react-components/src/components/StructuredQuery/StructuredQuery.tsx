import * as React from 'react';
import { Button, ComboBox, Dropdown, TextInput } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';
import { defaultMessages, Messages } from './messages';
import {
  structuredQueryClass,
  structuredQueryDropdownClass,
  structuredQueryRulesClass,
  structuredQueryRulesButtonsClass
} from './cssClasses';
import { insertDropdownInMessage } from './utils/insertDropdownInMessage';

export interface StructuredQueryProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages?: Partial<Messages>;
}

export const StructuredQuery: React.FunctionComponent<StructuredQueryProps> = ({
  messages = defaultMessages
}) => {
  const mergedMessages = { ...defaultMessages, ...messages };

  const handleOnChange = () => {
    // TODO: Fully implement handling dropdown selections in a future issue
  };

  const handleSatisfyRulesDropdownOnChange = () => {
    // TODO: Fully implement handling satisfy rules dropdown selections in a future issue
  };

  const satisfyRulesDropdownElement = (
    <Dropdown
      id="structured-query-dropdown"
      items={[
        mergedMessages.satisfyRulesDropdownAllOptionText,
        mergedMessages.satisfyRulesDropdownAnyOptionText
      ]}
      type="inline"
      initialSelectedItem={mergedMessages.satisfyRulesDropdownAllOptionText}
      label={mergedMessages.satisfyRulesDropdownLabelText}
      onChange={handleSatisfyRulesDropdownOnChange}
    />
  );

  return (
    <div className={structuredQueryClass}>
      <div className={structuredQueryDropdownClass}>
        {insertDropdownInMessage(
          mergedMessages.satisfyRulesDropdownText,
          satisfyRulesDropdownElement
        )}
      </div>
      <div className={structuredQueryRulesClass}>
        <ComboBox
          id="structured-query-rules-field-0"
          items={[]}
          placeholder={mergedMessages.fieldDropdownPlaceholderText}
          titleText={mergedMessages.fieldDropdownTitleText}
          onChange={handleOnChange}
        />
        <ComboBox
          id="structured-query-rules-operator-0"
          items={[
            mergedMessages.operatorDropdownIsOptionText,
            mergedMessages.operatorDropdownIsNotOptionText,
            mergedMessages.operatorDropdownContainsOptionText,
            mergedMessages.operatorDropdownDoesNotContainOptionText
          ]}
          placeholder={mergedMessages.operatorDropdownPlaceholderText}
          titleText={mergedMessages.operatorDropdownTitleText}
          onChange={handleOnChange}
        />
        <TextInput
          id="structured-query-rules-value-0"
          labelText={mergedMessages.valueInputLabelText}
          placeholder={mergedMessages.valueInputPlaceholderText}
        />
      </div>
      <div className={structuredQueryRulesButtonsClass}>
        <Button kind="ghost" renderIcon={Add16}>
          {mergedMessages.addRuleText}
        </Button>
        <Button kind="ghost" renderIcon={Add16}>
          {mergedMessages.addGroupRulesText}
        </Button>
      </div>
    </div>
  );
};
