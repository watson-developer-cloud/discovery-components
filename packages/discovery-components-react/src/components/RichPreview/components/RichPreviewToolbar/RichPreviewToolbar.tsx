import React, { SFC, useRef, useEffect, ReactElement } from 'react';
import { Button, FormLabel, Form, TextInput } from 'carbon-components-react';
import { settings } from 'carbon-components';

import ZoomIn24 from '@carbon/icons-react/lib/zoom--in/24.js';
import ZoomOut24 from '@carbon/icons-react/lib/zoom--out/24.js';
import CaretLeft24 from '@carbon/icons-react/lib/caret--left/24.js';
import CaretRight24 from '@carbon/icons-react/lib/caret--right/24.js';

export const ZOOM_IN = 'zoom-in';
export const ZOOM_OUT = 'zoom-out';

interface Props {
  /**
   * Current page number, starting at 1
   */
  current: number;
  /**
   * Total number of pages
   */
  total: number;
  /**
   * Callback for Zoom functionality
   */
  onZoom: (zoom: string) => void;
  /**
   * Callback for changing the current page
   */
  onChange: (newPage: number) => void;
}

const base = `${settings.prefix}--rp-toolbar`;

const RichPreviewToolbar: SFC<Props> = ({ current, total, onZoom, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current != null) {
      inputRef.current.value = current.toString();
    }
  }, [current]);

  return (
    <div className={`${base}`}>
      <div className={`${base}__spacer`} />
      <div className={`${base}__nav`}>
        {renderButton({
          icon: CaretLeft24,
          description: 'Previous Page',
          onClick: () => nextPrevButtonClicked(current, total, onChange, -1),
          disabled: current === 1
        })}
        <Form
          onSubmit={(e: Event): void => currentPageChanged(e, onChange, inputRef)}
          autoComplete="off"
        >
          <TextInput
            id="pageInput"
            defaultValue={current}
            type="number"
            ref={inputRef}
            min={1}
            max={total}
            className={`${base}__input`}
            onBlur={(e: Event): void => currentPageChanged(e, onChange, inputRef)}
            labelText="labelText"
            hideLabel={true}
          />
        </Form>
        <FormLabel className={`${base}__pageLabel`}>/ {total}</FormLabel>
        {renderButton({
          icon: CaretRight24,
          description: 'Next Page',
          onClick: () => nextPrevButtonClicked(current, total, onChange, 1),
          disabled: current === total
        })}
      </div>
      <div className={`${base}__zoom`}>
        {renderButton({
          icon: ZoomIn24,
          description: 'Zoom In',
          onClick: () => onZoom(ZOOM_IN),
          disabled: false
        })}
        {renderButton({
          icon: ZoomOut24,
          description: 'Zoom Out',
          onClick: () => onZoom(ZOOM_OUT),
          disabled: false
        })}
      </div>
    </div>
  );
};

RichPreviewToolbar.defaultProps = {
  current: 1
};

function renderButton(obj: {
  icon: React.Component;
  description: string;
  onClick: () => void;
  disabled: boolean;
}): ReactElement {
  return (
    <Button
      className={`${base}__button`}
      disabled={obj.disabled}
      size="small"
      kind="ghost"
      renderIcon={obj.icon}
      iconDescription={obj.description}
      tooltipPosition="bottom"
      tooltipAlignment="center"
      onClick={obj.onClick}
      hasIconOnly
    />
  );
}

function nextPrevButtonClicked(
  current: number,
  total: number,
  onChange: (page: number) => void,
  change: number
): void {
  const newPage = current + change;
  if (newPage >= 1 && newPage <= total) {
    onChange(newPage);
  }
}

function currentPageChanged(e: Event, onChange: (page: number) => void, inputRef: any): void {
  e.preventDefault();
  console.log(typeof inputRef);
  console.log(inputRef);
  const pageInput = Number(inputRef.current.value);
  onChange(pageInput);
}

export default RichPreviewToolbar;
