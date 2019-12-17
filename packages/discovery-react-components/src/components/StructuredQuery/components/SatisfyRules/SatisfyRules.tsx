import * as React from 'react';
import { Dropdown } from 'carbon-components-react';
import { Messages } from 'components/StructuredQuery/messages';
import { structuredQuerySatisfyRulesDropdownClass } from 'components/StructuredQuery/cssClasses';
import { formatMessage } from 'utils/formatMessage';

export interface SatisfyRulesProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
}

export const SatisfyRules: React.FunctionComponent<SatisfyRulesProps> = ({ messages }) => {
  const satisfyRulesDropdownItems = [
    { label: messages.satisfyRulesDropdownAllOptionText, value: ',' },
    { label: messages.satisfyRulesDropdownAnyOptionText, value: '|' }
  ];

  const handleOnChange = () => {
    // TODO: Fully implement handling satisfy rules dropdown selections in a future issue
  };

  const satisfyRulesDropdownElement = (
    <Dropdown
      id="structured-query-dropdown"
      items={satisfyRulesDropdownItems}
      type="inline"
      initialSelectedItem={messages.satisfyRulesDropdownAllOptionText}
      label={messages.satisfyRulesDropdownLabelText}
      onChange={handleOnChange}
      key="structured-query-dropdown"
    />
  );

  return (
    <div className={structuredQuerySatisfyRulesDropdownClass}>
      {formatMessage(messages.satisfyRulesDropdownText, { dropdown: satisfyRulesDropdownElement })}
    </div>
  );
};
