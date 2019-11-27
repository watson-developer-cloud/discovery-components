import React from 'react';
import { render, BoundFunction, GetByText, AllByText, fireEvent } from '@testing-library/react';
import DetailsPane from '../DetailsPane';
import { Items, OnActiveLinkChangeFn } from '../types';

describe('<DetailsPane />', () => {
  const dummyData: Items[] = [
    {
      heading: 'categories',
      items: [
        {
          label: 'Liability'
        }
      ]
    },
    { heading: 'types', items: ['Nature: Right, Party: Agent', 'Nature: Right, Party: Employee'] },
    {
      heading: 'attributes',
      items: [
        { type: 'Currency', label: 'Currency (1)', link: true },
        { type: 'Number', label: 'Number (1)', link: true }
      ]
    }
  ];

  let getByText: BoundFunction<GetByText>,
    getAllByText: BoundFunction<AllByText>,
    onActiveLinkChange: OnActiveLinkChangeFn;

  beforeEach(() => {
    onActiveLinkChange = jest.fn();
    ({ getByText, getAllByText } = render(
      <DetailsPane items={dummyData} onActiveLinkChange={onActiveLinkChange} />
    ));
  });

  it('Checks if details pane has title and sections', () => {
    getByText('Details');
    getByText('Categories');
    getByText('Liability');
    getByText('Types');
    getByText('Nature: Right, Party: Agent');

    getByText('Attributes');
    getByText('Currency (1)');
    getByText('Number (1)');
  });

  it('Checks if correct number of Attribute Links are displayed', () => {
    const links = getAllByText(/(\w+ )+\(\d+\)/);
    expect(links).toHaveLength(2);
  });

  it('checks if attributes are clicked', () => {
    fireEvent.click(getByText('Number (1)'));

    expect(onActiveLinkChange).toHaveBeenCalledWith({
      sectionTitle: 'attributes',
      type: 'Number'
    });
  });
});
