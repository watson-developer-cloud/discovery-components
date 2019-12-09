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
   * override the default text for the default 'any' dropdown option
   */
  satisfyRulesDropdownAnyOptionText: string;
  /**
   * override the default text for the button to add a rule
   */
  addRuleText: string;
  /**
   * override the default text for the button to add a group of rules
   */
  addGroupRulesText: string;
  /**
   * override the default text for the Field selection title
   */
  fieldSelectionTitleText: string;
  /**
   * override the default text for the Operator selection title
   */
  operatorSelectionTitleText: string;
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
  addRuleText: 'Add rule',
  addGroupRulesText: 'Add group of rules',
  fieldSelectionTitleText: 'Field',
  operatorSelectionTitleText: 'Operator',
  valueInputLabelText: 'Value',
  valueInputPlaceholderText: 'Enter value'
};
