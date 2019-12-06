import React from 'react';
import { render, GetByText, BoundFunction, fireEvent } from '@testing-library/react';
import MetadataPane from '../MetadataPane';
import { mockMetadata } from '../__fixtures__/metadata';

const noop = (): void => {};

describe('<MetadataPane />', () => {
  const onActiveMetadataChange = jest.fn();
  let getByText: BoundFunction<GetByText>;

  beforeEach(() => {
    ({ getByText } = render(
      <MetadataPane
        metadata={mockMetadata}
        onActiveMetadataChange={onActiveMetadataChange}
        activeMetadataId="107370"
        onActivePartyChange={noop}
      />
    ));
  });

  it('renders without crashing', () => {
    getByText('Effective dates');
    getByText('Contract terms');
  });

  it('Checks if correct Links are displayed', () => {
    getByText('2011-10-24');
    getByText('2008-12-22');
    getByText('15 days');
    getByText('45 days');
  });

  it('checks if metadata links are clicked', () => {
    fireEvent.click(getByText('2008-12-22'));

    expect(onActiveMetadataChange).toHaveBeenCalledWith({
      data: [
        {
          confidence_level: 'Medium',
          location: { begin: 2533, end: 2549 },
          metadataType: 'effective_dates',
          text: '22 December 2008',
          text_normalized: '2008-12-22'
        }
      ],
      metadataId: '2533_2549',
      metadataType: 'effective_dates'
    });
  });
});
