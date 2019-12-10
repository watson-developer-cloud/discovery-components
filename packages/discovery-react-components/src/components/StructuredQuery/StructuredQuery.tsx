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
  const satisfyRulesDropdownTextArr = mergedMessages.satisfyRulesDropdownText.split('%');
  const dropdownIndex = satisfyRulesDropdownTextArr.findIndex(text => text === 'dropdown');
  const satisfyRulesDropdownTextArrLength = satisfyRulesDropdownTextArr.length;

  const handleOnChange = () => {
    // TODO: Fully implement handling dropdown selections in a future issue
  };

  return (
    // TODO: Break each element out into own component once have all together here
    <div className={structuredQueryClass}>
      <div className={structuredQueryDropdownClass}>
        {/* TODO: Think of ways to improve readability here */}
        <p>
          {satisfyRulesDropdownTextArrLength === 3 ||
          (satisfyRulesDropdownTextArrLength === 2 && dropdownIndex === 1)
            ? satisfyRulesDropdownTextArr[0]
            : ''}
        </p>
        <Dropdown
          id="structured-query-dropdown"
          items={[
            mergedMessages.satisfyRulesDropdownAllOptionText,
            mergedMessages.satisfyRulesDropdownAnyOptionText
          ]}
          type="inline"
          initialSelectedItem={mergedMessages.satisfyRulesDropdownAllOptionText}
          label="Choose whether to satisfy all or any of the following rules"
        />
        <p>
          {satisfyRulesDropdownTextArrLength === 3 ? satisfyRulesDropdownTextArr[2] : ''}
          {satisfyRulesDropdownTextArrLength === 2 && dropdownIndex === 0
            ? satisfyRulesDropdownTextArr[1]
            : ''}
        </p>
      </div>
      {/* TODO: Make this whole row into a Rule component? */}
      <div className={structuredQueryRulesClass}>
        {/* Only needs title text for the first instance of the field/operator/value selection? Not sure */}
        {/* TODO: Improve ids for when the rules get nested */}
        <ComboBox
          id="structured-query-rules-field"
          items={[]}
          placeholder={mergedMessages.fieldDropdownPlaceholderText}
          titleText={mergedMessages.fieldDropdownTitleText}
          onChange={handleOnChange}
        />
        <ComboBox
          id="structured-query-rules-operator"
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
          id="structured-query-rules-value"
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
