export interface Messages {
  /**
   * override the default text about satisfying all/any of the rules
   * Use %dropdown% as a placeholder in the text to specify where the dropdown should appear
   */
  satisfyRulesDropdownText: string;
  /**
   * override the default text for the 'all' dropdown option
   */
  satisfyRulesDropdownAllOptionText: string;
  /**
   * override the default text for the 'any' dropdown option
   */
  satisfyRulesDropdownAnyOptionText: string;
  /**
   * override the default label text used as the textual representation of what the satisfy rules dropdown is for
   */
  satisfyRulesDropdownLabelText: string;
  /**
   * override the default text for the button to add a rule
   */
  addRuleText: string;
  /**
   * override the default text for the button to add a group of rules
   */
  addGroupRulesText: string;
  /**
   * override the default placeholder text for the Field dropdown
   */
  fieldDropdownPlaceholderText: string;
  /**
   * override the default text for the Field dropdown title
   */
  fieldDropdownTitleText: string;
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
}

export const defaultMessages: Messages = {
  satisfyRulesDropdownText: 'Satisfy %dropdown% of the following rules',
  satisfyRulesDropdownAllOptionText: 'all',
  satisfyRulesDropdownAnyOptionText: 'any',
  satisfyRulesDropdownLabelText: 'Choose whether to satisfy all or any of the following rules',
  addRuleText: 'Add rule',
  addGroupRulesText: 'Add group of rules',
  fieldDropdownPlaceholderText: 'Select field',
  fieldDropdownTitleText: 'Field',
  operatorDropdownIsOptionText: 'is',
  operatorDropdownIsNotOptionText: 'is not',
  operatorDropdownContainsOptionText: 'contains',
  operatorDropdownDoesNotContainOptionText: 'does not contain',
  operatorDropdownPlaceholderText: 'Select operator',
  operatorDropdownTitleText: 'Operator',
  valueInputLabelText: 'Value',
  valueInputPlaceholderText: 'Enter value'
};
