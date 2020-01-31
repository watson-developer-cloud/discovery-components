import React, { FC, Dispatch, SetStateAction } from 'react';
import { Dropdown } from 'carbon-components-react';
import { Messages } from 'components/StructuredQuery/messages';
import { structuredQueryRuleGroupDropdownClass } from 'components/StructuredQuery/cssClasses';
import { formatMessage } from 'utils/formatMessage';
import {
  StructuredQuerySelection,
  RuleGroupDropdownSelectedItem
} from 'components/StructuredQuery/utils/structuredQueryInterfaces';

export interface RuleGroupDropdownProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
  /**
   * state that represents the current rules and selections for the structured query
   */
  structuredQuerySelection: StructuredQuerySelection;
  /**
   * used to set the structuredQuerySelection state
   */
  setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
  /**
   * id of the group for the rule group dropdown
   */
  groupId: number;
}

export const RuleGroupDropdown: FC<RuleGroupDropdownProps> = ({
  messages,
  structuredQuerySelection,
  setStructuredQuerySelection,
  groupId
}) => {
  const ruleGroupDropdownItems = [
    { label: messages.ruleGroupDropdownAllOptionText, value: ',' },
    { label: messages.ruleGroupDropdownAnyOptionText, value: '|' }
  ];

  const handleOnChangeRuleGroupDropdown = (
    ruleGroupDropdownSelection: RuleGroupDropdownSelectedItem
  ) => {
    setStructuredQuerySelection({
      ...structuredQuerySelection,
      groups: {
        ...structuredQuerySelection.groups,
        [`${groupId}`]: {
          ...structuredQuerySelection.groups[groupId],
          operator: ruleGroupDropdownSelection.selectedItem.value
        }
      }
    });
  };

  const ruleGroupDropdownElement = (
    <Dropdown
      id="structured-query-dropdown"
      items={ruleGroupDropdownItems}
      type="inline"
      initialSelectedItem={messages.ruleGroupDropdownAllOptionText}
      label={messages.ruleGroupDropdownLabelText}
      key="structured-query-dropdown"
      onChange={handleOnChangeRuleGroupDropdown}
    />
  );

  return (
    <div className={structuredQueryRuleGroupDropdownClass}>
      {formatMessage(messages.ruleGroupDropdownText, { dropdown: ruleGroupDropdownElement })}
    </div>
  );
};
