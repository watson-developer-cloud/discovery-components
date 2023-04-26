import React from 'react';
import { render, RenderResult, fireEvent } from '@testing-library/react';
import StructuredQuery, { StructuredQueryProps } from '../StructuredQuery';
import { wrapWithContext } from 'utils/testingUtils';
import {
  SearchContextIFC,
  searchResponseStoreDefaults,
  fetchDocumentsResponseStoreDefaults,
  SearchApiIFC
} from 'components/DiscoverySearch/DiscoverySearch';
import DiscoveryV2 from 'ibm-watson/discovery/v2';

interface SetupParams {
  projectFields?: DiscoveryV2.Field[];
  fieldsStoreLoadingState?: boolean;
  fieldsStoreErrorState?: boolean;
  apiOverrides?: Partial<SearchApiIFC>;
}
interface Setup {
  structuredQuery: RenderResult;
}

function setup(
  {
    projectFields,
    fieldsStoreLoadingState = false,
    fieldsStoreErrorState = false,
    apiOverrides = {}
  }: SetupParams,
  componentProps: Partial<StructuredQueryProps> = {}
): Setup {
  let context: Partial<SearchContextIFC> = {
    searchResponseStore: {
      ...searchResponseStoreDefaults
    },
    fetchDocumentsResponseStore: {
      ...fetchDocumentsResponseStoreDefaults
    },
    fieldsStore: {
      data: { fields: projectFields },
      isLoading: fieldsStoreLoadingState,
      isError: fieldsStoreErrorState,
      parameters: {
        projectId: ''
      },
      error: null
    }
  };
  const structuredQuery = render(
    wrapWithContext(<StructuredQuery {...componentProps} />, apiOverrides, context)
  );
  return {
    structuredQuery
  };
}

describe('<StructuredQuery />', () => {
  let structuredQuery: RenderResult;
  let projectFields: DiscoveryV2.Field[] | undefined = undefined;
  let fieldsStoreLoadingState: boolean;
  let fieldsStoreErrorState: boolean;

  afterEach(() => {
    projectFields = undefined;
    fieldsStoreLoadingState = false;
    fieldsStoreErrorState = false;
  });

  describe('i18n messages', () => {
    describe('when no messages are provided', () => {
      describe('has the correct default text', () => {
        let structuredQuery: RenderResult;
        beforeEach(() => {
          structuredQuery = render(<StructuredQuery />);
        });

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
        test('operator dropdown has the correct default messages', () => {
          const operatorDropdownTitleText = structuredQuery.getByText('Operator');
          const operatorDropdownPlaceholderText =
            structuredQuery.getByPlaceholderText('Select operator');
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

    describe('when isLoading is true in fieldsStore', () => {
      beforeEach(() => {
        fieldsStoreLoadingState = true;
      });

      it('dropdown displays default loading text and is disabled', () => {
        ({ structuredQuery } = setup({ fieldsStoreLoadingState }));
        const fieldDropdownLoading = structuredQuery.getByPlaceholderText('Loading project fields');
        const fieldDropdownTitleText = structuredQuery.getByText('Field');
        expect(fieldDropdownLoading).toBeDefined();
        expect(fieldDropdownLoading).toHaveAttribute('disabled');
        expect(fieldDropdownTitleText).toBeDefined();
      });
    });

    describe('when isError is true in fieldsStore', () => {
      beforeEach(() => {
        fieldsStoreErrorState = true;
      });

      test('dropdown displays default error text and is disabled', () => {
        ({ structuredQuery } = setup({ fieldsStoreErrorState }));
        const fieldDropdownError = structuredQuery.getByPlaceholderText(
          'Error loading project fields'
        );
        expect(fieldDropdownError).toBeDefined();
        expect(fieldDropdownError).toHaveAttribute('disabled');
      });
    });

    describe('when there are fields in fieldsStore', () => {
      beforeEach(() => {
        projectFields = [{ field: 'field 1' }, { field: 'field 2' }];
      });

      it('displays default placeholder text and is not disabled', () => {
        ({ structuredQuery } = setup({ projectFields }));
        const fieldDropdown = structuredQuery.getByPlaceholderText('Select field');
        expect(fieldDropdown).toBeDefined();
        expect(fieldDropdown).not.toHaveAttribute('disabled');
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
                operatorDropdownTitleText: 'Hello operator',
                fieldDropdownPlaceholderText: 'Placeholder text'
              }}
            />
          );
          const addRuleGroupTextOverride = structuredQuery.getByText('A new rules group');
          const operatorDropdownTitleText = structuredQuery.getByText('Hello operator');
          const addRuleRowText = structuredQuery.getByText('Add rule');
          const operatorDropdownPlaceholderText =
            structuredQuery.getByPlaceholderText('Select operator');
          const valueInputPlaceholderText = structuredQuery.getByPlaceholderText('Enter value');
          const fieldLoadingOverride = structuredQuery.getByPlaceholderText('Placeholder text');
          expect(addRuleGroupTextOverride).toBeDefined();
          expect(operatorDropdownTitleText).toBeDefined();
          expect(addRuleRowText).toBeDefined();
          expect(operatorDropdownPlaceholderText).toBeDefined();
          expect(valueInputPlaceholderText).toBeDefined();
          expect(fieldLoadingOverride).toBeDefined();
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

  describe('On mount', () => {
    it('Calls fetch fields', () => {
      const mockFetchFields = jest.fn();
      ({ structuredQuery } = setup({ apiOverrides: { fetchFields: mockFetchFields } }));
      expect(mockFetchFields).toBeCalledTimes(1);
      expect(mockFetchFields).toBeCalledWith();
    });
  });

  describe('when there are fields available', () => {
    beforeEach(() => {
      projectFields = [{ field: 'field name 1' }, { field: 'field name 2' }];
    });

    describe('and I choose field name 1 in the fieldname combobox', () => {
      beforeEach(() => {
        ({ structuredQuery } = setup({ projectFields }));
        const input = structuredQuery.getByPlaceholderText('Select field');
        fireEvent.change(input, { target: { value: 'field name 1' } });
      });

      it('should display field name 1', () => {
        expect(structuredQuery.getByText('field name 1')).toBeInTheDocument();
      });
    });
  });

  describe('query conversion and display', () => {
    describe('when one rule row has field, operator, and value selected in one top-level group', () => {
      let structuredQuery: RenderResult;
      beforeEach(() => {
        projectFields = [{ field: 'field_name_1' }];
        ({ structuredQuery } = setup({ projectFields }));
      });

      it('should render the correct query as each is selected', () => {
        const field = structuredQuery.getByPlaceholderText('Select field');
        const operator = structuredQuery.getByPlaceholderText('Select operator');
        const value = structuredQuery.getByPlaceholderText('Enter value');
        fireEvent.click(field);
        fireEvent.click(structuredQuery.getByText('field_name_1'));
        let query = structuredQuery.getByLabelText('code-snippet');
        expect(query.textContent).toEqual('field_name_1');
        fireEvent.click(operator);
        fireEvent.click(structuredQuery.getByText('is'));
        query = structuredQuery.getByLabelText('code-snippet');
        expect(query.textContent).toEqual('field_name_1::');
        fireEvent.change(value, { target: { value: 'Watson' } });
        query = structuredQuery.getByLabelText('code-snippet');
        expect(query.textContent).toEqual('field_name_1::"Watson"');
      });
    });

    describe('when multiple rows of field, operator, and value are selected in one top-level group', () => {
      let structuredQuery: RenderResult;
      beforeEach(() => {
        projectFields = [
          { field: 'field_name_1' },
          { field: 'field_name_2' },
          { field: 'field_name_3' }
        ];
        ({ structuredQuery } = setup({ projectFields }));
        const addRuleButton = structuredQuery.getByText('Add rule');
        addRuleButton.click();
        addRuleButton.click();
        const fields = structuredQuery.queryAllByPlaceholderText('Select field');
        const operators = structuredQuery.queryAllByPlaceholderText('Select operator');
        const values = structuredQuery.queryAllByPlaceholderText('Enter value');
        fireEvent.click(fields[0]);
        fireEvent.click(structuredQuery.getByText('field_name_1'));
        fireEvent.click(operators[0]);
        fireEvent.click(structuredQuery.getByText('contains'));
        fireEvent.click(values[0]);
        fireEvent.change(values[0], { target: { value: 'Watson' } });
        fireEvent.click(fields[1]);
        fireEvent.click(structuredQuery.getByText('field_name_2'));
        fireEvent.click(operators[1]);
        fireEvent.click(structuredQuery.getByText('is not'));
        fireEvent.click(values[1]);
        fireEvent.change(values[1], { target: { value: 'machine' } });
        fireEvent.click(fields[2]);
        fireEvent.click(structuredQuery.getByText('field_name_3'));
        fireEvent.click(operators[2]);
        fireEvent.click(structuredQuery.getByText('does not contain'));
        fireEvent.click(values[2]);
        fireEvent.change(values[2], { target: { value: 'learning' } });
      });

      it('should render the correct query', () => {
        const query = structuredQuery.getByLabelText('code-snippet');
        expect(query.textContent).toEqual(
          'field_name_1:"Watson",field_name_2::!"machine",field_name_3:!"learning"'
        );
      });

      describe('and the rule group dropdown operator is changed', () => {
        it('should update to use the updated rule group operator in the query', () => {
          const ruleGroupDropdownOperator = structuredQuery.getByText('all');
          ruleGroupDropdownOperator.click();
          fireEvent.click(structuredQuery.getByText('any'));
          const query = structuredQuery.getByLabelText('code-snippet');
          expect(query.textContent).toEqual(
            'field_name_1:"Watson"|field_name_2::!"machine"|field_name_3:!"learning"'
          );
        });
      });
    });

    describe('when fields, operators, and values are selected across top-level and nested groups', () => {
      let structuredQuery: RenderResult;
      beforeEach(() => {
        projectFields = [
          { field: 'field_name_1' },
          { field: 'field_name_2' },
          { field: 'field_name_3' },
          { field: 'field_name_4' },
          { field: 'field_name_5' },
          { field: 'field_name_6' }
        ];
        ({ structuredQuery } = setup({ projectFields }));
        let addRuleButton = structuredQuery.getByText('Add rule');
        addRuleButton.click();
        addRuleButton.click();
        const addRuleGroupButton = structuredQuery.getByText('Add group of rules');
        addRuleGroupButton.click();
        addRuleButton = structuredQuery.getByText('Add rule');
        addRuleButton.click();
        addRuleButton.click();
        const fields = structuredQuery.queryAllByPlaceholderText('Select field');
        const operators = structuredQuery.queryAllByPlaceholderText('Select operator');
        const values = structuredQuery.queryAllByPlaceholderText('Enter value');
        fireEvent.click(fields[0]);
        fireEvent.click(structuredQuery.getByText('field_name_1'));
        fireEvent.click(operators[0]);
        fireEvent.click(structuredQuery.getByText('contains'));
        fireEvent.click(values[0]);
        fireEvent.change(values[0], { target: { value: 'Watson' } });
        fireEvent.click(fields[1]);
        fireEvent.click(structuredQuery.getByText('field_name_2'));
        fireEvent.click(operators[1]);
        fireEvent.click(structuredQuery.getByText('is not'));
        fireEvent.click(values[1]);
        fireEvent.change(values[1], { target: { value: 'machine' } });
        fireEvent.click(fields[2]);
        fireEvent.click(structuredQuery.getByText('field_name_3'));
        fireEvent.click(operators[2]);
        fireEvent.click(structuredQuery.getByText('does not contain'));
        fireEvent.click(values[2]);
        fireEvent.change(values[2], { target: { value: 'learning' } });
        fireEvent.click(fields[3]);
        fireEvent.click(structuredQuery.getByText('field_name_4'));
        fireEvent.click(operators[3]);
        fireEvent.click(structuredQuery.getByText('is'));
        fireEvent.click(values[3]);
        fireEvent.change(values[3], { target: { value: 'classification' } });
        fireEvent.click(fields[4]);
        fireEvent.click(structuredQuery.getByText('field_name_5'));
        fireEvent.click(operators[4]);
        fireEvent.click(structuredQuery.getByText('is not'));
        fireEvent.click(values[4]);
        fireEvent.change(values[4], { target: { value: 'regression' } });
        fireEvent.click(fields[5]);
        fireEvent.click(structuredQuery.getByText('field_name_6'));
        fireEvent.click(operators[5]);
        fireEvent.click(structuredQuery.getByText('contains'));
        fireEvent.click(values[5]);
        fireEvent.change(values[5], { target: { value: 'IBM' } });
      });

      it('should render the correct query', () => {
        const query = structuredQuery.getByLabelText('code-snippet');
        expect(query.textContent).toEqual(
          'field_name_1:"Watson",field_name_2::!"machine",field_name_3:!"learning",(field_name_4::"classification",field_name_5::!"regression",field_name_6:"IBM")'
        );
      });
    });

    describe('when there are reserved characters in selections', () => {
      let structuredQuery: RenderResult;
      beforeEach(() => {
        projectFields = [
          { field: 'field_!name_1' },
          { field: 'field_name::_2' },
          { field: '|field_name_3' }
        ];
        ({ structuredQuery } = setup({ projectFields }));
        const addRuleButton = structuredQuery.getByText('Add rule');
        addRuleButton.click();
        addRuleButton.click();
        const fields = structuredQuery.queryAllByPlaceholderText('Select field');
        const operators = structuredQuery.queryAllByPlaceholderText('Select operator');
        const values = structuredQuery.queryAllByPlaceholderText('Enter value');
        fireEvent.click(fields[0]);
        fireEvent.click(structuredQuery.getByText('field_!name_1'));
        fireEvent.click(operators[0]);
        fireEvent.click(structuredQuery.getByText('contains'));
        fireEvent.click(values[0]);
        fireEvent.change(values[0], { target: { value: 'Watson' } });
        fireEvent.click(fields[1]);
        fireEvent.click(structuredQuery.getByText('field_name::_2'));
        fireEvent.click(operators[1]);
        fireEvent.click(structuredQuery.getByText('is not'));
        fireEvent.click(values[1]);
        fireEvent.change(values[1], { target: { value: 'machine' } });
        fireEvent.click(fields[2]);
        fireEvent.click(structuredQuery.getByText('|field_name_3'));
        fireEvent.click(operators[2]);
        fireEvent.click(structuredQuery.getByText('does not contain'));
        fireEvent.click(values[2]);
        fireEvent.change(values[2], { target: { value: 'l"earn"ing' } });
      });

      it('should render the correct query with escaped reserved characters in fields and double quotes in values', () => {
        const query = structuredQuery.getByLabelText('code-snippet');
        expect(query.textContent).toEqual(
          'field_\\!name_1:"Watson",field_name\\:\\:_2::!"machine",\\|field_name_3:!"l\\"earn\\"ing"'
        );
      });
    });
  });
});
