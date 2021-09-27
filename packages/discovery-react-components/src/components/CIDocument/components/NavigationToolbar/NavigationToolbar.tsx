import React, { FC } from 'react';
import cx from 'classnames';
import { settings } from 'carbon-components';
import { Button } from 'carbon-components-react';
import { ChevronLeft16 } from '@carbon/icons-react';
import { ChevronRight16 } from '@carbon/icons-react';
import { defaultMessages, Messages } from './messages';

type ChangeFn = (index: number) => void;

export interface NavigationToolbarProps {
  className?: string;
  index?: number;
  max: number;
  messages?: Messages;
  onChange: ChangeFn;
}

const NavigationToolbar: FC<NavigationToolbarProps> = ({
  className,
  index = 0,
  max,
  messages = defaultMessages,
  onChange
}) => {
  const base = `${settings.prefix}--ci-doc-toolbar`;
  return (
    <nav className={cx(base, className)} aria-label={messages.navigation}>
      <Button
        className="button"
        title={messages.previousLabel}
        kind="ghost"
        size="small"
        renderIcon={ChevronLeft16}
        aria-label={messages.previousLabel}
        iconDescription={messages.previousLabel}
        onClick={handleChange(onChange, index, max, -1)}
        data-testid="NavigationToolbar_previous"
      />
      <span className="text" data-testid="NavigationToolbar_counter">
        {messages
          .counterPattern!.replace('{index}', index > 0 ? String(index) : '-')
          .replace('{max}', String(max))}
      </span>
      <Button
        className="button"
        title={messages.nextLabel}
        kind="ghost"
        size="small"
        aria-label={messages.nextLabel}
        renderIcon={ChevronRight16}
        iconDescription={messages.nextLabel}
        onClick={handleChange(onChange, index, max, 1)}
        data-testid="NavigationToolbar_next"
      />
    </nav>
  );
};

function handleChange(onChange: ChangeFn, index: number, max: number, change: number) {
  return function (): void {
    // If the previous button is pressed when there is no index, set index to max.
    // Otherwise, set the index to the current index + or - 1, looping from 1 to max or max to 1 as needed
    const isBelowMin = index <= 0 && change < 0;
    const newIndex = isBelowMin ? max : ((max + (index - 1) + change) % max) + 1;
    onChange(newIndex);
  };
}

export default NavigationToolbar;
