import React, { FC } from 'react';
import { Button } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';
import { RuleGroupDropdown } from './components/RuleGroupDropdown/RuleGroupDropdown';
import { RuleRow } from './components/RuleRow/RuleRow';
import { defaultMessages, Messages } from './messages';
import { structuredQueryClass, structuredQueryRulesButtonsClass } from './cssClasses';

export interface StructuredQueryProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages?: Partial<Messages>;
}

export const StructuredQuery: FC<StructuredQueryProps> = ({ messages = defaultMessages }) => {
  const mergedMessages = { ...defaultMessages, ...messages };

  return (
    <div className={structuredQueryClass}>
      <RuleGroupDropdown messages={mergedMessages} />
      <RuleRow messages={mergedMessages} />
      <div className={structuredQueryRulesButtonsClass}>
        <Button kind="ghost" renderIcon={Add16}>
          {mergedMessages.addRuleRowText}
        </Button>
        <Button kind="ghost" renderIcon={Add16}>
          {mergedMessages.addRuleGroupText}
        </Button>
      </div>
    </div>
  );
};
