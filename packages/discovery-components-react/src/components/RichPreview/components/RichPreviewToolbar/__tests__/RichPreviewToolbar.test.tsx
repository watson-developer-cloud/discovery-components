import * as React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import RichPreviewToolbar from '../RichPreviewToolbar';

let current = 5;
let zoomLevel = '';

const pageUpdate = (newPage: number): void => {
  current = newPage;
};

const zoomUpdate = (newZoom: string): void => {
  zoomLevel = newZoom;
};

afterEach(cleanup);

describe('RichPreviewToolbar', () => {
  let wrapper: any;
  let toolbarButtons: any;

  beforeEach(() => {
    wrapper = render(
      <RichPreviewToolbar current={current} total={10} onZoom={zoomUpdate} onChange={pageUpdate} />
    );
    toolbarButtons = wrapper.getAllByRole('button');
  });

  it('goes to the next page', () => {
    fireEvent.click(toolbarButtons[1]);

    expect(current).toEqual(6);
  });

  it('goes to the previous page', () => {
    fireEvent.click(toolbarButtons[0]);

    expect(current).toEqual(5);
  });

  it('goes to page 7', () => {
    const toolbarInput = wrapper.getByRole('textbox');
    const toolbarForm = wrapper.getByRole('form');

    toolbarInput.value = 7;
    fireEvent.submit(toolbarForm);
    expect(current).toEqual(7);
  });

  it('zooms in when clicked', () => {
    fireEvent.click(toolbarButtons[2]);

    expect(zoomLevel).toEqual('zoom-in');
  });

  it('zooms out when clicked', () => {
    fireEvent.click(toolbarButtons[3]);

    expect(zoomLevel).toEqual('zoom-out');
  });
});
