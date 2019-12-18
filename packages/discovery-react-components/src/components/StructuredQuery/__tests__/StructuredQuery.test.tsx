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
        test('rule group dropdown has the correct default messages', () => {
          const ruleGroupDropdownTextOne = structuredQuery.getByText('Satisfy', {
            exact: false
          });
          const ruleGroupDropdownTextTwo = structuredQuery.getByText('of the following rules', {
            exact: false
          });
          const ruleGroupDropdownAllOptionText = structuredQuery.getByText('all');
          expect(ruleGroupDropdownTextOne).toBeDefined();
          expect(ruleGroupDropdownTextTwo).toBeDefined();
          expect(ruleGroupDropdownAllOptionText).toBeDefined();
        });
        test('add rules has the correct default messages', () => {
          const addRuleRowText = structuredQuery.getByText('Add rule');
          const addGroupRulesText = structuredQuery.getByText('Add group of rules');
          expect(addRuleRowText).toBeDefined();
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
      describe('when the rule group dropdown is overridden', () => {
        test('and the dropdown is at the end', () => {
          const structuredQuery = render(
            <StructuredQuery
              messages={{
                ruleGroupDropdownText: 'Satisfy you must of the following rules {dropdown}'
              }}
            />
          );
          const ruleGroupDropdownText = structuredQuery.getByText(
            'Satisfy you must of the following rules',
            { exact: false }
          );
          expect(ruleGroupDropdownText).toBeDefined();
        });

        test('and the dropdown is at the beginning', () => {
          const structuredQuery = render(
            <StructuredQuery
              messages={{
                ruleGroupDropdownText: '{dropdown} of the following rules must be satisfied'
              }}
            />
          );
          const ruleGroupDropdownText = structuredQuery.getByText(
            'of the following rules must be satisfied',
            { exact: false }
          );
          expect(ruleGroupDropdownText).toBeDefined();
        });
      });
      describe('when some messages are overridden and others are not', () => {
        test('only the provided messages are overridden and defaults are used for the rest', () => {
          const structuredQuery = render(
            <StructuredQuery
              messages={{
                addRuleGroupText: 'A new rules group',
                fieldDropdownPlaceholderText: 'Field choice selection',
                operatorDropdownTitleText: 'Hello operator'
              }}
            />
          );
          const addRuleGroupTextOverride = structuredQuery.getByText('A new rules group');
          const fieldDropdownPlaceholderTextOverride = structuredQuery.getByPlaceholderText(
            'Field choice selection'
          );
          const operatorDropdownTitleText = structuredQuery.getByText('Hello operator');
          const addRuleRowText = structuredQuery.getByText('Add rule');
          const operatorDropdownPlaceholderText = structuredQuery.getByPlaceholderText(
            'Select operator'
          );
          const valueInputPlaceholderText = structuredQuery.getByPlaceholderText('Enter value');
          expect(addRuleGroupTextOverride).toBeDefined();
          expect(fieldDropdownPlaceholderTextOverride).toBeDefined();
          expect(operatorDropdownTitleText).toBeDefined();
          expect(addRuleRowText).toBeDefined();
          expect(operatorDropdownPlaceholderText).toBeDefined();
          expect(valueInputPlaceholderText).toBeDefined();
        });
      });
    });
  });

  describe('top-level rule rows', () => {
    let structuredQuery: RenderResult;
    beforeEach(() => {
      structuredQuery = render(<StructuredQuery />);
    });
    describe('on initial load', () => {
      test('there is one top-level rule row', () => {
        const fields = structuredQuery.queryAllByText('Field');
        const operators = structuredQuery.queryAllByText('Operator');
        const values = structuredQuery.queryAllByText('Value');
        expect(fields.length).toEqual(1);
        expect(operators.length).toEqual(1);
        expect(values.length).toEqual(1);
      });

      test('and the one top-level rule row does not have a Remove row button', () => {
        const removeRuleButton = structuredQuery.queryByLabelText('Remove row');
        expect(removeRuleButton).toBe(null);
      });
    });

    describe('when the Add rule button is clicked', () => {
      beforeEach(() => {
        const addRuleButton = structuredQuery.getByText('Add rule');
        addRuleButton.click();
      });

      test('a new rule row is added', () => {
        const fields = structuredQuery.queryAllByText('Field');
        const operators = structuredQuery.queryAllByText('Operator');
        const values = structuredQuery.queryAllByText('Value');
        expect(fields.length).toEqual(2);
        expect(operators.length).toEqual(2);
        expect(values.length).toEqual(2);
      });

      test('and both rule rows now include the Remove rule button', () => {
        const removeRuleButton = structuredQuery.queryAllByLabelText('Remove row');
        expect(removeRuleButton.length).toEqual(2);
      });
    });

    describe('when the Remove rule button is clicked', () => {
      beforeEach(() => {
        const addRuleButton = structuredQuery.getByText('Add rule');
        addRuleButton.click();
        const removeRuleButton = structuredQuery.getAllByTestId('remove-row-button')[1];
        removeRuleButton.click();
      });

      test('one rule row is removed', () => {
        const fields = structuredQuery.queryAllByText('Field');
        const operators = structuredQuery.queryAllByText('Operator');
        const values = structuredQuery.queryAllByText('Value');
        expect(fields.length).toEqual(1);
        expect(operators.length).toEqual(1);
        expect(values.length).toEqual(1);
      });

      test('and no Remove rule buttons are displayed since only one rule row still remains', () => {
        const removeRuleButton = structuredQuery.queryByLabelText('Remove row');
        expect(removeRuleButton).toBe(null);
      });
    });
  });
});
