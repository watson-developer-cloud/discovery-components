import React, { FC, Dispatch, SetStateAction, SyntheticEvent } from 'react';
import { ComboBox, TextInput } from 'carbon-components-react';
import { RemoveRuleRowButton } from '../RemoveRuleRowButton/RemoveRuleRowButton';
import { Messages } from 'components/StructuredQuery/messages';
import { structuredQueryRulesClass } from 'components/StructuredQuery/cssClasses';
import {
  StructuredQuerySelection,
  OperatorDropdownSelectedItem
} from 'components/StructuredQuery/utils/structuredQueryInterfaces';

export interface RuleRowProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
  /**
   * id of the group for the rule row to render
   */
  groupId: number;
  /**
   * id of the rule row to render
   */
  rowId: number;
  /**
   * state that represents the current rules and selections for the structured query
   */
  structuredQuerySelection: StructuredQuerySelection;
  /**
   * used to set the structuredQuerySelection state
   */
  setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
}

export const RuleRow: FC<RuleRowProps> = ({
  messages,
  groupId,
  rowId,
  structuredQuerySelection,
  setStructuredQuerySelection
}) => {
  const operatorDropdownItems = [
    { label: messages.operatorDropdownIsOptionText, value: '::' },
    { label: messages.operatorDropdownIsNotOptionText, value: '::!' },
    { label: messages.operatorDropdownContainsOptionText, value: ':' },
    { label: messages.operatorDropdownDoesNotContainOptionText, value: ':!' }
  ];
  const isTopLevelGroup = groupId === 0;
  const showRemoveRuleRowButton =
    structuredQuerySelection.groups[groupId].rows.length > 1 || !isTopLevelGroup;

  const handleOperatorDropdownChange = (operatorSelection: OperatorDropdownSelectedItem) => {
    setStructuredQuerySelection({
      ...structuredQuerySelection,
      rows: {
        ...structuredQuerySelection.rows,
        [`${rowId}`]: {
          ...structuredQuerySelection.rows[rowId],
          operator: operatorSelection.selectedItem.value
        }
      }
    });
  };

  // const handleFieldDropdownChange = (fieldSelection: { selectedItem: { label: string; value: string } }) => {
  //   setStructuredQuerySelection({
  //     ...structuredQuerySelection,
  //     rows: {
  //       ...structuredQuerySelection.rows,
  //       [`${rowId}`]: {
  //         ...structuredQuerySelection.rows[rowId],
  //         field: fieldSelection.selectedItem.value
  //       }
  //     }
  //   })
  // }

  const handleValueInputChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const valueText: HTMLInputElement['value'] = event.currentTarget.value;
    setStructuredQuerySelection({
      ...structuredQuerySelection,
      rows: {
        ...structuredQuerySelection.rows,
        [`${rowId}`]: {
          ...structuredQuerySelection.rows[rowId],
          value: valueText
        }
      }
    });
  };

  return (
    <div className={structuredQueryRulesClass} data-testid={`rule-row-${groupId}`}>
      <ComboBox
        id={`structured-query-rules-field-${groupId}`}
        // TODO: Items is empty for now as it's a required field and retrieving fields for the dropdown
        // and adding them as items will be addressed in a future issue
        items={[]}
        placeholder={messages.fieldDropdownPlaceholderText}
        titleText={messages.fieldDropdownTitleText}
        // onChange={handleFieldDropdownChange}
      />
      <ComboBox
        id={`structured-query-rules-operator-${groupId}`}
        items={operatorDropdownItems}
        placeholder={messages.operatorDropdownPlaceholderText}
        titleText={messages.operatorDropdownTitleText}
        onChange={handleOperatorDropdownChange}
      />
      <TextInput
        id={`structured-query-rules-value-${groupId}`}
        labelText={messages.valueInputLabelText}
        placeholder={messages.valueInputPlaceholderText}
        onChange={handleValueInputChange}
      />
      {showRemoveRuleRowButton && (
        <RemoveRuleRowButton
          removeRuleRowButtonIconDescription={messages.removeRuleRowButtonIconDescription}
          groupId={groupId}
          rowId={rowId}
          structuredQuerySelection={structuredQuerySelection}
          setStructuredQuerySelection={setStructuredQuerySelection}
        />
      )}
    </div>
  );
};
