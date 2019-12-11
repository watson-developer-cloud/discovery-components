import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { SatisfyRules } from '../SatisfyRules';
import { defaultMessages } from 'components/StructuredQuery/messages';

describe('<SatisfyRules />', () => {
  describe('satisfy rules dropdown options and their selection', () => {
    let satisfyRules: RenderResult;
    beforeEach(() => {
      satisfyRules = render(<SatisfyRules messages={defaultMessages} />);
    });

    test('dropdown has correct initial selection', () => {
      const satisfyRulesDropdownAllOptionText = satisfyRules.getByText('all');
      const satisfyRulesDropdownAnyOptionText = satisfyRules.queryByText('any');
      expect(satisfyRulesDropdownAllOptionText).toBeDefined();
      expect(satisfyRulesDropdownAnyOptionText).toBe(null);
    });
    test('when clicked, dropdown shows expected set of options', () => {
      const satisfyRulesDropdownAllOptionText = satisfyRules.getByText('all');
      satisfyRulesDropdownAllOptionText.click();
      const satisfyRulesDropdownAnyOptionText = satisfyRules.getByText('any');
      expect(satisfyRulesDropdownAllOptionText).toBeDefined();
      expect(satisfyRulesDropdownAnyOptionText).toBeDefined();
    });
  });
});
