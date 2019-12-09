import * as React from 'react';
import { defaultMessages, Messages } from './messages';
import { Button, ComboBox, Dropdown, TextInput } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';

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
  const satisfyRulesDropdownTextArr = mergedMessages.satisfyRulesDropdownText.split('%dropdown%');

  return (
    // TODO: Break each element out into own component once have all together here
    // TODO: Remember to add ids and all required props to each of these Carbon components
    <>
      <div className="bx--structured-query-dropdown">
        <p>
          {satisfyRulesDropdownTextArr[0]}
          <Dropdown
            id="structured-query-dropdown"
            items={[
              mergedMessages.satisfyRulesDropdownAllOptionText,
              mergedMessages.satisfyRulesDropdownAnyOptionText
            ]}
            type="inline"
            initialSelectedItem={mergedMessages.satisfyRulesDropdownAllOptionText}
          />
          {satisfyRulesDropdownTextArr[1]}
        </p>
      </div>
      {/* TODO: Make this whole row into a Rule component? */}
      {/* TODO: All text needs to be added to messages/defaultMessages */}
      <div className="bx--structured-query-rules">
        <ComboBox titleText={mergedMessages.fieldSelectionTitleText} />
        <ComboBox titleText={mergedMessages.operatorSelectionTitleText} />
        <TextInput
          labelText={mergedMessages.valueInputLabelText}
          placeholder={mergedMessages.valueInputPlaceholderText}
        />
      </div>
      <div className="bx--structured-query-rules__buttons">
        <Button kind="ghost" renderIcon={Add16}>
          {mergedMessages.addRuleText}
        </Button>
        <Button kind="ghost" renderIcon={Add16}>
          {mergedMessages.addGroupRulesText}
        </Button>
      </div>
    </>
  );
};
