export interface Messages {
  /**
   * override the default text for the rule group dropdown about satisfying all/any of the rules
   * Use {dropdown} as a placeholder in the text to specify where the dropdown should appear
   */
  ruleGroupDropdownText: string;
  /**
   * override the default text for the 'all' dropdown option
   */
  ruleGroupDropdownAllOptionText: string;
  /**
   * override the default text for the 'any' dropdown option
   */
  ruleGroupDropdownAnyOptionText: string;
  /**
   * override the default label text used as the textual representation of what the rule group dropdown is for
   */
  ruleGroupDropdownLabelText: string;
  /**
   * override the default placeholder text for the Field dropdown
   */
  fieldDropdownPlaceholderText: string;
  /**
   * override the default text for the Field dropdown title
   */
  fieldDropdownTitleText: string;
  /**
   * override the default text to display when projectFields are being fetched
   */
  fieldDropdownLoadingText: string;
  /**
   * override the default text to display when there was an error loading project fields
   */
  fieldDropdownErrorText: string;
  /**
   * override the default placeholder text for the Operator dropdown
   */
  operatorDropdownPlaceholderText: string;
  /**
   * override the default text for the Operator dropdown title
   */
  operatorDropdownTitleText: string;
  /**
   * override the default text for the Operator dropdown 'is' option
   */
  operatorDropdownIsOptionText: string;
  /**
   * override the default text for the Operator dropdown 'is not' option
   */
  operatorDropdownIsNotOptionText: string;
  /**
   * override the default text for the Operator dropdown 'contains' option
   */
  operatorDropdownContainsOptionText: string;
  /**
   * override the default text for the Operator dropdown 'does not contain' option
   */
  operatorDropdownDoesNotContainOptionText: string;
  /**
   * override the default text for the Value input label text
   */
  valueInputLabelText: string;
  /**
   * override the default text for the Value input placeholder text
   */
  valueInputPlaceholderText: string;
  /**
   * override the default text for the button to add a rule row to a rule group
   */
  addRuleRowText: string;
  /**
   * override the default text for the icon description for the button to remove a rule row from a rule group
   */
  removeRuleRowButtonIconDescription: string;
  /**
   * override the default text for the button to add a group of rules
   */
  addRuleGroupText: string;
}

export const defaultMessages: Messages = {
  ruleGroupDropdownText: 'Satisfy {dropdown} of the following rules',
  ruleGroupDropdownAllOptionText: 'all',
  ruleGroupDropdownAnyOptionText: 'any',
  ruleGroupDropdownLabelText: 'Choose whether to satisfy all or any of the following rules',
  fieldDropdownPlaceholderText: 'Select field',
  fieldDropdownTitleText: 'Field',
  fieldDropdownLoadingText: 'Loading project fields',
  fieldDropdownErrorText: 'Error loading project fields',
  operatorDropdownIsOptionText: 'is',
  operatorDropdownIsNotOptionText: 'is not',
  operatorDropdownContainsOptionText: 'contains',
  operatorDropdownDoesNotContainOptionText: 'does not contain',
  operatorDropdownPlaceholderText: 'Select operator',
  operatorDropdownTitleText: 'Operator',
  valueInputLabelText: 'Value',
  valueInputPlaceholderText: 'Enter value',
  addRuleRowText: 'Add rule',
  removeRuleRowButtonIconDescription: 'Remove rule',
  addRuleGroupText: 'Add group of rules'
};
