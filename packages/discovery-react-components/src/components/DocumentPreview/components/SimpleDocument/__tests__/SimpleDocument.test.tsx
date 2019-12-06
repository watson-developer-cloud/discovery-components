import React from 'react';
import { act, render, BoundFunction, GetByText } from '@testing-library/react';
import SimpleDocument from '../SimpleDocument';
import docArrayJson from '@DocumentPreview/__fixtures__/ArtEffectsTextArray.json';

describe('SimpleDocument', () => {
  const minimalDoc = {
    id: '1234567890',
    extracted_metadata: {
      filename: 'i_am_a_file'
    }
  };

  it('renders a very minimal document', () => {
    act(() => {
      render(
        <SimpleDocument
          document={minimalDoc}
          setHideToolbarControls={(): void => {}}
          setLoading={(): void => {}}
        />
      );
    });
  });

  it('renders with array wrapped text', () => {
    let getByText: BoundFunction<GetByText> = () => {
      throw new Error();
    };

    const spy = jest.spyOn(console, 'log');
    expect(spy).not.toHaveBeenCalled();
    act(() => {
      ({ getByText } = render(
        <SimpleDocument
          document={docArrayJson}
          setLoading={(): void => {}}
          setHideToolbarControls={(): void => console.log('setHideToolbarControls called')}
        />
      ));
    });
    expect(spy).toHaveBeenCalled();
    getByText(
      'services) for its business operations and to meet obligations in connection with transactions under the Prime-Contract. This',
      { exact: false }
    );
  });
});
