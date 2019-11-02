import React, { FC } from 'react';
import { settings } from 'carbon-components';
import { Button } from 'carbon-components-react';
import ChevronLeft16 from '@carbon/icons-react/lib/chevron--left/16';
import ChevronRight16 from '@carbon/icons-react/lib/chevron--right/16';

type ChangeFn = (index: number) => void;

interface NavToolbarProps {
  className?: string;
  index?: number;
  max: number;
  previousLabel?: string;
  nextLabel?: string;
  counterPattern?: string;
  onChange: ChangeFn;
}

const NavigationToolbar: FC<NavToolbarProps> = ({
  className,
  index = 0,
  max,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  counterPattern = '{index} / {max}',
  onChange
}) => {
  const base = `${settings.prefix}--semantic-doc-toolbar`;
  return (
    <nav className={className}>
      <Button
        className={`${base}__button`}
        title={previousLabel}
        kind="ghost"
        size="small"
        renderIcon={ChevronLeft16}
        iconDescription={previousLabel}
        onClick={handleChange(onChange, index, max, -1)}
      />
      <span className={`${base}__text`}>
        {counterPattern
          .replace('{index}', index > 0 ? String(index) : '-')
          .replace('{max}', String(max))}
      </span>
      <Button
        className={`${base}__button`}
        title={nextLabel}
        kind="ghost"
        size="small"
        renderIcon={ChevronRight16}
        iconDescription={nextLabel}
        onClick={handleChange(onChange, index, max, 1)}
      />
    </nav>
  );
};

function handleChange(onChange: ChangeFn, index: number, max: number, change: number) {
  return function(): void {
    // If the previous button is pressed when there is no index, set index to max.
    // Otherwise, set the index to the current index + or - 1, looping from 1 to max or max to 1 as needed
    const isBelowMin = index <= 0 && change < 0;
    const newIndex = isBelowMin ? max : ((max + (index - 1) + change) % max) + 1;
    onChange(newIndex);
  };
}

export default NavigationToolbar;
