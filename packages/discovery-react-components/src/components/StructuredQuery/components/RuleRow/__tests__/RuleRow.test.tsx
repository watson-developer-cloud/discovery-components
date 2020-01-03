import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import StructuredQuery from 'components/StructuredQuery/StructuredQuery';

describe('<RuleRow />', () => {
  describe('operator rules dropdown options', () => {
    let structuredQuery: RenderResult;
    beforeEach(() => {
      structuredQuery = render(<StructuredQuery />);
    });

    test('when clicked, dropdown shows expected set of options', () => {
      const ruleRowOperatorDropdown = structuredQuery.getByPlaceholderText('Select operator');
      ruleRowOperatorDropdown.click();
      const ruleRowOperatorIsText = structuredQuery.getByText('is');
      const ruleRowOperatorIsNotText = structuredQuery.getByText('is not');
      const ruleRowOperatorContainsText = structuredQuery.getByText('contains');
      const ruleRowOperatorDoesNotContainText = structuredQuery.getByText('does not contain');
      expect(ruleRowOperatorIsText).toBeDefined();
      expect(ruleRowOperatorIsNotText).toBeDefined();
      expect(ruleRowOperatorContainsText).toBeDefined();
      expect(ruleRowOperatorDoesNotContainText).toBeDefined();
    });
  });
});
