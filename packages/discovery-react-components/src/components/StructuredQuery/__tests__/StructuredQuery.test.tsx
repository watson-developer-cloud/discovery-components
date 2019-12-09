// TODO: First can set up tests for all the messages
import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { StructuredQuery } from '../StructuredQuery';

describe('<StructuredQuery />', () => {
  describe('i18n messages', () => {
    describe('when no messages are provided', () => {
      let structuredQuery: RenderResult;
      beforeEach(() => {
        structuredQuery = render(<StructuredQuery />);
      });

      describe('has the correct default text', () => {
        test('dropdown has the correct default messages', () => {
          const satisfyRulesDropdownTextOne = structuredQuery.getByText('Satisfy ', {
            exact: false
          });
          const satisfyRulesDropdownTextTwo = structuredQuery.getByText(' of the following rules', {
            exact: false
          });
          const satisfyRulesDropdownAllOptionText = structuredQuery.getByText('all');
          expect(satisfyRulesDropdownTextOne).toBeDefined();
          expect(satisfyRulesDropdownTextTwo).toBeDefined();
          expect(satisfyRulesDropdownAllOptionText).toBeDefined();
        });
        test('add rules has the correct default messages', () => {
          const addRuleText = structuredQuery.getByText('Add rule');
          const addGroupRulesText = structuredQuery.getByText('Add group of rules');
          expect(addRuleText).toBeDefined();
          expect(addGroupRulesText).toBeDefined();
        });
        test('field selection has the correct default messages', () => {
          const fieldSelectionTitleText = structuredQuery.getByText('Field');
          expect(fieldSelectionTitleText).toBeDefined();
        });
        test('operator selection has the correct default messages', () => {
          const operatorSelectionTitleText = structuredQuery.getByText('Operator');
          expect(operatorSelectionTitleText).toBeDefined();
        });
        test('value input has the correct default messages', () => {
          const valueInputLabelText = structuredQuery.getByText('Value');
          const valueInputPlaceholderText = structuredQuery.getByPlaceholderText('Enter value');
          expect(valueInputLabelText).toBeDefined();
          expect(valueInputPlaceholderText).toBeDefined();
        });
      });
    });
  });
});
