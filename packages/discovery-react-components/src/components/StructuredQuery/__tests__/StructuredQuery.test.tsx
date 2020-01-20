import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import StructuredQuery from '../StructuredQuery';

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

      test('and the one top-level rule row does not have a Remove rule button', () => {
        const removeRuleButton = structuredQuery.queryByTestId('remove-rule-row-button-0');
        expect(removeRuleButton).toBe(null);
      });

      test('and the Add rule button is shown', () => {
        const addRuleButton = structuredQuery.getByText('Add rule');
        expect(addRuleButton).toBeDefined();
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
        const removeRuleButtons = structuredQuery.queryAllByTestId('remove-rule-row-button-0');
        expect(removeRuleButtons.length).toEqual(2);
      });
    });

    describe('when the Remove rule button is clicked', () => {
      beforeEach(() => {
        const addRuleButton = structuredQuery.getByText('Add rule');
        addRuleButton.click();
        const removeRuleButton = structuredQuery.queryAllByTestId('remove-rule-row-button-0')[1];
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
        const removeRuleButton = structuredQuery.queryByTestId('remove-rule-row-button-0');
        expect(removeRuleButton).toBe(null);
      });
    });

    describe('max number of rule row siblings', () => {
      test('the Add rule button still shows when there is one less than the max number of allowed rule row siblings', () => {
        const addRuleButton = structuredQuery.getByText('Add rule');
        addRuleButton.click();
        const getAddRuleButtonAgain = structuredQuery.getByText('Add rule');
        expect(getAddRuleButtonAgain).toBeDefined();
      });

      test('and the Add rule button no longer shows once the max number of allowed rule row siblings is added', () => {
        const addRuleButton = structuredQuery.getByText('Add rule');
        addRuleButton.click();
        addRuleButton.click();
        const getAddRuleButtonAgain = structuredQuery.queryByText('Add rule');
        expect(getAddRuleButtonAgain).toBe(null);
      });
    });
  });

  describe('nested rule groups', () => {
    let structuredQuery: RenderResult;
    beforeEach(() => {
      structuredQuery = render(<StructuredQuery />);
    });

    describe('adding new nested rule groups', () => {
      describe('when the Add group of rules button is initially clicked', () => {
        beforeEach(() => {
          const addRuleGroupButton = structuredQuery.getByText('Add group of rules');
          addRuleGroupButton.click();
        });

        test('one new nested rule group is added', () => {
          const ruleGroups = structuredQuery.queryAllByTestId('rule-group');
          expect(ruleGroups.length).toEqual(2);
        });

        test('and it has a Remove rule button', () => {
          const removeRuleRowButton = structuredQuery.queryAllByTestId('remove-rule-row-button-1');
          expect(removeRuleRowButton.length).toEqual(1);
        });

        test('and it has a button to add a rule', () => {
          const addRuleRowButtons = structuredQuery.queryAllByText('Add rule');
          expect(addRuleRowButtons.length).toEqual(2);
        });

        test('and it does not have a button to add another level of rule groups', () => {
          const addRuleGroupButtons = structuredQuery.queryAllByText('Add group of rules');
          expect(addRuleGroupButtons.length).toEqual(1);
        });
      });

      describe('when adding multiple groups of rules', () => {
        let addRuleGroupButton: HTMLElement;
        beforeEach(() => {
          addRuleGroupButton = structuredQuery.getByText('Add group of rules');
          addRuleGroupButton.click();
          addRuleGroupButton.click();
        });

        test('a new group of rules is added for each click of the Add group of rules button, with one rule row each', () => {
          const ruleGroups = structuredQuery.queryAllByTestId('rule-group');
          const ruleRowsTopLevel = structuredQuery.queryAllByTestId('rule-row-0');
          const ruleRowsGroupZero = structuredQuery.queryAllByTestId('rule-row-1');
          const ruleRowsGroupOne = structuredQuery.queryAllByTestId('rule-row-2');
          expect(ruleGroups.length).toEqual(3);
          expect(ruleRowsTopLevel.length).toEqual(1);
          expect(ruleRowsGroupZero.length).toEqual(1);
          expect(ruleRowsGroupOne.length).toEqual(1);
        });

        test('the Add group of rule buttons is no longer displayed when the max number of nested rule groups has been added', () => {
          addRuleGroupButton.click();
          addRuleGroupButton.click();
          addRuleGroupButton = structuredQuery.getByText('Add group of rules');
          expect(addRuleGroupButton).toBeDefined();
          addRuleGroupButton.click();
          const addRuleGroupButtonQuery = structuredQuery.queryByText('Add group of rules');
          expect(addRuleGroupButtonQuery).toBe(null);
        });
      });
    });

    describe('adding rule rows to nested rule groups', () => {
      let addRuleGroupButton: HTMLElement;
      let addRuleToGroupZeroButton: HTMLElement;
      beforeEach(() => {
        addRuleGroupButton = structuredQuery.getByText('Add group of rules');
        addRuleGroupButton.click();
        addRuleToGroupZeroButton = structuredQuery.queryAllByText('Add rule')[0];
        addRuleToGroupZeroButton.click();
      });
      test('each click of the Add rule button adds one new rule to the correct nested rule group', () => {
        let ruleRowsGroupZero = structuredQuery.queryAllByTestId('rule-row-1');
        expect(ruleRowsGroupZero.length).toEqual(2);
        addRuleGroupButton.click();
        const addRuleRowToGroupOneButton = structuredQuery.queryAllByText('Add rule')[1];
        addRuleRowToGroupOneButton.click();
        let ruleRowsGroupOne = structuredQuery.queryAllByTestId('rule-row-2');
        expect(ruleRowsGroupOne.length).toEqual(2);
        addRuleToGroupZeroButton.click();
        ruleRowsGroupZero = structuredQuery.queryAllByTestId('rule-row-1');
        expect(ruleRowsGroupZero.length).toEqual(3);
        addRuleRowToGroupOneButton.click();
        ruleRowsGroupOne = structuredQuery.queryAllByTestId('rule-row-2');
        expect(ruleRowsGroupOne.length).toEqual(3);
      });
      test('no more rules can be added to a nested rule group past the max number of allowed rule row siblings', () => {
        expect(structuredQuery.queryAllByText('Add rule').length).toBe(2);
        addRuleToGroupZeroButton.click();
        expect(structuredQuery.queryAllByText('Add rule').length).toBe(1);
      });
    });

    describe('removing rule rows from nested rule groups', () => {
      let addRuleGroupButton: HTMLElement;
      beforeEach(() => {
        addRuleGroupButton = structuredQuery.getByText('Add group of rules');
        addRuleGroupButton.click();
      });
      describe('when there are multiple nested rule row groups', () => {
        let addRuleRowToGroupOneButton: HTMLElement;
        let addRuleRowToGroupTwoButton: HTMLElement;
        // This sets up two nested rule groups, with two rule rows in group one and three rule rows in group two
        beforeEach(() => {
          addRuleGroupButton.click();
          addRuleGroupButton.click();
          addRuleRowToGroupOneButton = structuredQuery.queryAllByText('Add rule')[1];
          addRuleRowToGroupOneButton.click();
          addRuleRowToGroupTwoButton = structuredQuery.queryAllByText('Add rule')[2];
          addRuleRowToGroupTwoButton.click();
          addRuleRowToGroupTwoButton.click();
        });
        test('clicking Remove rule buttons in group one removes rules from group one', () => {
          let ruleRowsGroupOne = structuredQuery.queryAllByTestId('rule-row-2');
          expect(ruleRowsGroupOne.length).toEqual(2);
          const removeRuleRowFromGroupOneButton = structuredQuery.queryAllByTestId(
            'remove-rule-row-button-2'
          )[0];
          removeRuleRowFromGroupOneButton.click();
          ruleRowsGroupOne = structuredQuery.queryAllByTestId('rule-row-2');
          expect(ruleRowsGroupOne.length).toEqual(1);
        });
        test('clicking Remove rule buttons in group two removes rules from group two', () => {
          let ruleRowsGroupTwo = structuredQuery.queryAllByTestId('rule-row-3');
          expect(ruleRowsGroupTwo.length).toEqual(3);
          let removeRuleRowFromGroupTwoButton = structuredQuery.queryAllByTestId(
            'remove-rule-row-button-3'
          )[0];
          removeRuleRowFromGroupTwoButton.click();
          ruleRowsGroupTwo = structuredQuery.queryAllByTestId('rule-row-3');
          expect(ruleRowsGroupTwo.length).toEqual(2);
          removeRuleRowFromGroupTwoButton = structuredQuery.queryAllByTestId(
            'remove-rule-row-button-3'
          )[0];
          removeRuleRowFromGroupTwoButton.click();
          ruleRowsGroupTwo = structuredQuery.queryAllByTestId('rule-row-3');
          expect(ruleRowsGroupTwo.length).toEqual(1);
          removeRuleRowFromGroupTwoButton = structuredQuery.queryAllByTestId(
            'remove-rule-row-button-3'
          )[0];
          removeRuleRowFromGroupTwoButton.click();
          const ruleRowsGroupTwoQuery = structuredQuery.queryByTestId('rule-row-3');
          expect(ruleRowsGroupTwoQuery).toBe(null);
        });
      });
      describe('when there is a singular nested rule row group', () => {
        describe('when the Remove rule icon is clicked and it is not the last remaining rule row in a nested rule group', () => {
          test('one click removes one rule row from the correct nested rule group', () => {
            const addRuleButton = structuredQuery.queryAllByText('Add rule')[0];
            addRuleButton.click();
            addRuleButton.click();
            const removeRuleRowButtons = structuredQuery.queryAllByText('Remove rule');
            expect(structuredQuery.queryAllByTestId('rule-row-1').length).toEqual(3);
            removeRuleRowButtons[2].click();
            expect(structuredQuery.queryAllByTestId('rule-row-1').length).toEqual(2);
            removeRuleRowButtons[1].click();
            expect(structuredQuery.queryAllByTestId('rule-row-1').length).toEqual(1);
          });
        });
        describe('when the Remove rule icon is clicked for the last remaining rule row in a nested rule group', () => {
          test('the entire nested group is removed', () => {
            const addRuleButton = structuredQuery.queryAllByText('Add rule')[0];
            addRuleButton.click();
            addRuleButton.click();
            const removeRuleRowButtons = structuredQuery.queryAllByText('Remove rule');
            removeRuleRowButtons[2].click();
            removeRuleRowButtons[1].click();
            let ruleGroups = structuredQuery.queryAllByTestId('rule-group');
            let nestedRuleGroupZero = structuredQuery.queryByTestId('rule-row-1');
            expect(ruleGroups.length).toEqual(2);
            expect(nestedRuleGroupZero).toBeDefined();
            removeRuleRowButtons[0].click();
            ruleGroups = structuredQuery.queryAllByTestId('rule-group');
            nestedRuleGroupZero = structuredQuery.queryByTestId('rule-row-1');
            expect(ruleGroups.length).toEqual(1);
            expect(nestedRuleGroupZero).toBe(null);
          });
        });
      });
    });
  });
});
