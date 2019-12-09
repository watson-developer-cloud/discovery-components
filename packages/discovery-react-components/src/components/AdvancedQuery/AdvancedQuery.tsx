import * as React from 'react';
import { defaultMessages, Messages } from './messages';
import { Button, ComboBox, Dropdown, TextInput } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';

export interface AdvancedQueryProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages?: Partial<Messages>;
}

export const AdvancedQuery: React.FunctionComponent<AdvancedQueryProps> = ({
  messages = defaultMessages
}) => {
  const mergedMessages = { ...defaultMessages, ...messages };
  const satisfyRulesDropdownTextArr = mergedMessages.satisfyRulesDropdownText.split('%dropdown%');

  return (
    // TODO: Break each element out into own component once have all together here
    // TODO: Remember to add ids and all required props to each of these Carbon components
    <>
      <p>
        {satisfyRulesDropdownTextArr[0]}
        <Dropdown
          id="advanced-query-dropdown"
          items={[
            mergedMessages.satisfyRulesDropdownAllOptionText,
            mergedMessages.satisfyRulesDropdownAnyOptionText
          ]}
          type="inline"
          initialSelectedItem={mergedMessages.satisfyRulesDropdownAllOptionText}
        />
        {satisfyRulesDropdownTextArr[1]}
      </p>
      {/* TODO: Make this whole row into a Rule component? */}
      {/* TODO: All text needs to be added to messages/defaultMessages */}
      <ComboBox titleText="Field" />
      <ComboBox titleText="Operator" />
      <TextInput labelText="Value" placeholder="Enter value" />
      <Button kind="ghost" renderIcon={Add16}>
        Add rule
      </Button>
      <Button kind="ghost" renderIcon={Add16}>
        Add group of rules
      </Button>
    </>
  );
};
