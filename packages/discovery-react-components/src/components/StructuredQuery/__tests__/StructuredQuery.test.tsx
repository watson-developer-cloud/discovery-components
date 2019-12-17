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
        test('satisfy rules dropdown has the correct default messages', () => {
          const satisfyRulesDropdownTextOne = structuredQuery.getByText('Satisfy', {
            exact: false
          });
          const satisfyRulesDropdownTextTwo = structuredQuery.getByText('of the following rules', {
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
        test('field dropdown has the correct default messages', () => {
          const fieldDropdownTitleText = structuredQuery.getByText('Field');
          const fieldDropdownPlaceholderText = structuredQuery.getByPlaceholderText('Select field');
          expect(fieldDropdownTitleText).toBeDefined();
          expect(fieldDropdownPlaceholderText).toBeDefined();
        });
        test('operator dropdown has the correct default messages', () => {
          const operatorDropdownTitleText = structuredQuery.getByText('Operator');
          const operatorDropdownPlaceholderText = structuredQuery.getByPlaceholderText(
            'Select operator'
          );
          expect(operatorDropdownTitleText).toBeDefined();
          expect(operatorDropdownPlaceholderText).toBeDefined();
        });
        test('value input has the correct default messages', () => {
          const valueInputLabelText = structuredQuery.getByText('Value');
          const valueInputPlaceholderText = structuredQuery.getByPlaceholderText('Enter value');
          expect(valueInputLabelText).toBeDefined();
          expect(valueInputPlaceholderText).toBeDefined();
        });
      });
    });

    describe('when default messages are overridden', () => {
      describe('when the satisfy rules dropdown is overridden', () => {
        test('and the dropdown is at the end', () => {
          const structuredQuery = render(
            <StructuredQuery
              messages={{
                satisfyRulesDropdownText: 'Satisfy you must of the following rules {dropdown}'
              }}
            />
          );
          const satisfyRulesDropdownText = structuredQuery.getByText(
            'Satisfy you must of the following rules',
            { exact: false }
          );
          expect(satisfyRulesDropdownText).toBeDefined();
        });

        test('and the dropdown is at the beginning', () => {
          const structuredQuery = render(
            <StructuredQuery
              messages={{
                satisfyRulesDropdownText: '{dropdown} of the following rules must be satisfied'
              }}
            />
          );
          const satisfyRulesDropdownText = structuredQuery.getByText(
            'of the following rules must be satisfied',
            { exact: false }
          );
          expect(satisfyRulesDropdownText).toBeDefined();
        });
      });
      describe('when some messages are overridden and others are not', () => {
        test('only the provided messages are overridden and defaults are used for the rest', () => {
          const structuredQuery = render(
            <StructuredQuery
              messages={{
                addGroupRulesText: 'A new rules group',
                fieldDropdownPlaceholderText: 'Field choice selection',
                operatorDropdownTitleText: 'Hello operator'
              }}
            />
          );
          const addGroupRulesTextOverride = structuredQuery.getByText('A new rules group');
          const fieldDropdownPlaceholderTextOverride = structuredQuery.getByPlaceholderText(
            'Field choice selection'
          );
          const operatorDropdownTitleText = structuredQuery.getByText('Hello operator');
          const addRuleText = structuredQuery.getByText('Add rule');
          const operatorDropdownPlaceholderText = structuredQuery.getByPlaceholderText(
            'Select operator'
          );
          const valueInputPlaceholderText = structuredQuery.getByPlaceholderText('Enter value');
          expect(addGroupRulesTextOverride).toBeDefined();
          expect(fieldDropdownPlaceholderTextOverride).toBeDefined();
          expect(operatorDropdownTitleText).toBeDefined();
          expect(addRuleText).toBeDefined();
          expect(operatorDropdownPlaceholderText).toBeDefined();
          expect(valueInputPlaceholderText).toBeDefined();
        });
      });
    });
  });
});
