import React, { FC, useState, useContext, useEffect } from 'react';
import { Button } from 'carbon-components-react';
import { RuleGroup } from './components/RuleGroup/RuleGroup';
import { AddRuleRowButton } from './components/AddRuleRowButton/AddRuleRowButton';
import { AddRuleGroupButton } from './components/AddRuleGroupButton/AddRuleGroupButton';
import { defaultMessages, Messages } from './messages';
import { structuredQueryClass, structuredQueryRulesButtonsClass } from './cssClasses';
import { MAX_NUM_SIBLING_RULE_ROWS, MAX_NUM_NESTED_RULE_GROUPS } from './constants';
import { StructuredQuerySelection, stringifyStructuredQuerySelection } from './utils';
import { withErrorBoundary } from 'react-error-boundary';
import { FallbackComponent } from 'utils/FallbackComponent';
import onErrorCallback from 'utils/onErrorCallback';
import { SearchApi } from 'components/DiscoverySearch/DiscoverySearch';

export interface StructuredQueryProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages?: Partial<Messages>;
}

const StructuredQuery: FC<StructuredQueryProps> = ({ messages = defaultMessages }) => {
  const mergedMessages = { ...defaultMessages, ...messages };
  const [structuredQuerySelection, setStructuredQuerySelection] = useState<
    StructuredQuerySelection
  >({
    groups: {
      0: { rows: [0], operator: ',' }
    },
    rows: {
      0: {
        field: null,
        operator: null,
        value: ''
      }
    },
    group_order: [0]
  });

  const [touched, setStateTouched] = useState<boolean>(false);

  const showAddRuleRowButton =
    structuredQuerySelection.groups[0].rows.length < MAX_NUM_SIBLING_RULE_ROWS;
  const showAddRuleGroupButton =
    Object.keys(structuredQuerySelection.groups).length - 1 < MAX_NUM_NESTED_RULE_GROUPS;

  const { fetchFields } = useContext(SearchApi);
  useEffect(() => {
    fetchFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValidSelection = (structuredQuerySelection: StructuredQuerySelection) => {
    const missingFields = Object.keys(structuredQuerySelection.rows).filter(
      row => structuredQuerySelection.rows[row].field === null
    );
    const missingOperators = Object.keys(structuredQuerySelection.rows).filter(
      row => structuredQuerySelection.rows[row].operator === null
    );
    const missingValues = Object.keys(structuredQuerySelection.rows).filter(
      row => structuredQuerySelection.rows[row].value === ''
    );
    return missingFields.length + missingOperators.length + missingValues.length === 0;
  };

  const handleOnClick = () => {
    setStateTouched(true);
    const validSelection: boolean = isValidSelection(structuredQuerySelection);
    if (validSelection) {
      stringifyStructuredQuerySelection(structuredQuerySelection);
    }
  };

  return (
    <div className={structuredQueryClass}>
      {structuredQuerySelection.group_order.map(id => {
        return (
          <RuleGroup
            messages={mergedMessages}
            groupId={id}
            key={id}
            structuredQuerySelection={structuredQuerySelection}
            setStructuredQuerySelection={setStructuredQuerySelection}
            touched={touched}
          />
        );
      })}
      <div className={structuredQueryRulesButtonsClass}>
        {showAddRuleRowButton && (
          <AddRuleRowButton
            addRuleRowText={mergedMessages.addRuleRowText}
            setStructuredQuerySelection={setStructuredQuerySelection}
            structuredQuerySelection={structuredQuerySelection}
            groupId={0}
          />
        )}
        {showAddRuleGroupButton && (
          <AddRuleGroupButton
            addRuleGroupText={mergedMessages.addRuleGroupText}
            setStructuredQuerySelection={setStructuredQuerySelection}
            structuredQuerySelection={structuredQuerySelection}
          />
        )}
      </div>
      <Button onClick={handleOnClick}>Run query</Button>
    </div>
  );
};

export default withErrorBoundary(
  StructuredQuery,
  FallbackComponent('StructuredQuery'),
  onErrorCallback
);
