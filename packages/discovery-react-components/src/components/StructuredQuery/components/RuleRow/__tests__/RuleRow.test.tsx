import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { RuleRow } from '../RuleRow';
import { defaultMessages } from 'components/StructuredQuery/messages';

describe('<RuleRow />', () => {
  describe('operator rules dropdown options', () => {
    let ruleRow: RenderResult;
    beforeEach(() => {
      ruleRow = render(<RuleRow messages={defaultMessages} />);
    });

    test('when clicked, dropdown shows expected set of options', () => {
      const ruleRowOperatorDropdown = ruleRow.getByPlaceholderText('Select operator');
      ruleRowOperatorDropdown.click();
      const ruleRowOperatorIsText = ruleRow.getByText('is');
      const ruleRowOperatorIsNotText = ruleRow.getByText('is not');
      const ruleRowOperatorContainsText = ruleRow.getByText('contains');
      const ruleRowOperatorDoesNotContainText = ruleRow.getByText('does not contain');
      expect(ruleRowOperatorIsText).toBeDefined();
      expect(ruleRowOperatorIsNotText).toBeDefined();
      expect(ruleRowOperatorContainsText).toBeDefined();
      expect(ruleRowOperatorDoesNotContainText).toBeDefined();
    });
  });
});
