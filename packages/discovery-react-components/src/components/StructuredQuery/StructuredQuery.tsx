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
  const dropdownIsInMiddleOfText = satisfyRulesDropdownTextArr.length === 3 ? true : false;
  const dropdownIsAtBeginningOfText =
    satisfyRulesDropdownTextArr.findIndex(text => text === 'dropdown') === 0 ? true : false;

  const handleOnChange = () => {
    // TODO: Fully implement handling dropdown selections in a future issue
  };

  const satisfyRulesDropdown = (
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
  );

  return (
    // TODO: Break each element out into own component once have all together here
    <div className={structuredQueryClass}>
      <div className={structuredQueryDropdownClass}>
        {dropdownIsInMiddleOfText ? (
          <>
            <p>{satisfyRulesDropdownTextArr[0]}</p>
            {satisfyRulesDropdown}
            <p>{satisfyRulesDropdownTextArr[2]}</p>
          </>
        ) : dropdownIsAtBeginningOfText ? (
          <>
            {satisfyRulesDropdown}
            <p>{satisfyRulesDropdownTextArr[1]}</p>
          </>
        ) : (
          <>
            <p>{satisfyRulesDropdownTextArr[0]}</p>
            {satisfyRulesDropdown}
          </>
        )}
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
