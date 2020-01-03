import React, { FC, useState } from 'react';
import { Button } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';
import { RuleGroupDropdown } from './components/RuleGroupDropdown/RuleGroupDropdown';
import { RuleRow } from './components/RuleRow/RuleRow';
import { defaultMessages, Messages } from './messages';
import { structuredQueryClass, structuredQueryRulesButtonsClass } from './cssClasses';
import { MAX_NUM_SIBLING_RULE_ROWS } from './constants';
import { withErrorBoundary } from 'react-error-boundary';
import { FallbackComponent } from 'utils/FallbackComponent';
import onErrorCallback from 'utils/onErrorCallback';

export interface StructuredQueryProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages?: Partial<Messages>;
}

const StructuredQuery: FC<StructuredQueryProps> = ({ messages = defaultMessages }) => {
  const mergedMessages = { ...defaultMessages, ...messages };
  const [ruleRows, setRuleRows] = useState({ rows: [{ id: 0 }] });
  const showAddRuleRowButton = ruleRows.rows.length < MAX_NUM_SIBLING_RULE_ROWS;

  const handleAddRuleRowOnClick = () => {
    const newRuleRowId = ruleRows.rows[ruleRows.rows.length - 1].id + 1;
    const newRuleRow = { id: newRuleRowId };
    setRuleRows({
      ...ruleRows,
      rows: ruleRows.rows.concat(newRuleRow)
    });
  };

  return (
    <div className={structuredQueryClass}>
      <RuleGroupDropdown messages={mergedMessages} />
      {ruleRows.rows.map(row => {
        return (
          <RuleRow
            messages={mergedMessages}
            rowId={row.id}
            key={row.id}
            setRuleRows={setRuleRows}
            ruleRows={ruleRows}
          />
        );
      })}
      <div className={structuredQueryRulesButtonsClass}>
        {showAddRuleRowButton && (
          <Button kind="ghost" renderIcon={Add16} onClick={handleAddRuleRowOnClick}>
            {mergedMessages.addRuleRowText}
          </Button>
        )}
        <Button kind="ghost" renderIcon={Add16}>
          {mergedMessages.addRuleGroupText}
        </Button>
      </div>
    </div>
  );
};

export default withErrorBoundary(
  StructuredQuery,
  FallbackComponent('StructuredQuery'),
  onErrorCallback
);
