// TODO: Need to add explanatory comments to all of these
export interface Messages {
  satisfyRulesDropdownText: string;
  satisfyRulesDropdownAllOptionText: string;
  satisfyRulesDropdownAnyOptionText: string;
  addRuleText: string;
  addGroupRulesText: string;
  fieldSelectionTitleText: string;
  operatorSelectionTitleText: string;
  valueInputLabelText: string;
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
