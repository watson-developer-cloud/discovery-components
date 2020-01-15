import React, { FC } from 'react';
import { Dropdown } from 'carbon-components-react';
import { Messages } from 'components/StructuredQuery/messages';
import { structuredQueryRuleGroupDropdownClass } from 'components/StructuredQuery/cssClasses';
import { formatMessage } from 'utils/formatMessage';

export interface RuleGroupDropdownProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
}

export const RuleGroupDropdown: FC<RuleGroupDropdownProps> = ({ messages }) => {
  const ruleGroupDropdownItems = [
    { label: messages.ruleGroupDropdownAllOptionText, value: ',' },
    { label: messages.ruleGroupDropdownAnyOptionText, value: '|' }
  ];

  const ruleGroupDropdownElement = (
    <Dropdown
      id="structured-query-dropdown"
      items={ruleGroupDropdownItems}
      type="inline"
      initialSelectedItem={messages.ruleGroupDropdownAllOptionText}
      label={messages.ruleGroupDropdownLabelText}
      key="structured-query-dropdown"
    />
  );

  return (
    <div className={structuredQueryRuleGroupDropdownClass}>
      {formatMessage(messages.ruleGroupDropdownText, true, { dropdown: ruleGroupDropdownElement })}
    </div>
  );
};
