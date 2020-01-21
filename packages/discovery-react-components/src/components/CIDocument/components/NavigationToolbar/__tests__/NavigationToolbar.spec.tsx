import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import NavigationToolbar from '../NavigationToolbar';

describe('<NavigationToolbar />', () => {
  it('displays the cuurent index and max', () => {
    const { getByText } = render(<NavigationToolbar index={1} max={50} onChange={() => {}} />);
    getByText('1 / 50');
  });

  it('calls the change function on clicks of the previous button', () => {
    const onChangeSpy = jest.fn();
    const { getByTitle } = render(<NavigationToolbar index={1} max={50} onChange={onChangeSpy} />);

    expect(onChangeSpy).not.toHaveBeenCalled();

    fireEvent.click(getByTitle('Previous'));

    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(50);
  });

  it('calls the change function on clicks of the next button', () => {
    const onChangeSpy = jest.fn();
    const { getByTitle } = render(<NavigationToolbar index={1} max={50} onChange={onChangeSpy} />);

    expect(onChangeSpy).not.toHaveBeenCalled();

    fireEvent.click(getByTitle('Next'));

    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(2);
  });
});
