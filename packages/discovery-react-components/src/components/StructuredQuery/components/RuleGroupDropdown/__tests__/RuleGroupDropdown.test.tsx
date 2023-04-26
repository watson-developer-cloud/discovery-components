import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { RuleGroupDropdown } from '../RuleGroupDropdown';
import { defaultMessages } from 'components/StructuredQuery/messages';

describe('<RuleGroupDropdown />', () => {
  describe('rule group dropdown options and their selection', () => {
    let ruleGroupDropdown: RenderResult;
    beforeEach(() => {
      // @ts-ignore
      const component = <RuleGroupDropdown messages={defaultMessages} />;
      ruleGroupDropdown = render(component);
    });

    test('dropdown has correct initial selection', () => {
      const ruleGroupDropdownAllOptionText = ruleGroupDropdown.getByText('all');
      const ruleGroupDropdownAnyOptionText = ruleGroupDropdown.queryByText('any');
      expect(ruleGroupDropdownAllOptionText).toBeDefined();
      expect(ruleGroupDropdownAnyOptionText).toBe(null);
    });
    test('when clicked, dropdown shows expected set of options', () => {
      const ruleGroupDropdownAllOptionText = ruleGroupDropdown.getByText('all');
      ruleGroupDropdownAllOptionText.click();
      const ruleGroupDropdownAnyOptionText = ruleGroupDropdown.getByText('any');
      expect(ruleGroupDropdownAllOptionText).toBeDefined();
      expect(ruleGroupDropdownAnyOptionText).toBeDefined();
    });
  });
});
