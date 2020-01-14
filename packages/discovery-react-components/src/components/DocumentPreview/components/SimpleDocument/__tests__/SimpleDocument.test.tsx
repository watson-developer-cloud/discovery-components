import React from 'react';
import { act, render, BoundFunction, GetByText } from '@testing-library/react';
import SimpleDocument from '../SimpleDocument';
import docArrayJson from '../../../__fixtures__/ArtEffectsTextArray.json';
import { SearchApiIFC, SearchContextIFC } from '../../../../DiscoverySearch/DiscoverySearch';
import { wrapWithContext } from '../../../../../utils/testingUtils';

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

  it('renders a document with a different body field', () => {
    const documentText = 'This is the text of the document.';
    const customDoc = {
      body_field: documentText
    };
    const context: Partial<SearchContextIFC> = {
      componentSettings: {
        fields_shown: {
          body: {
            field: 'body_field',
            use_passage: true
          }
        }
      }
    };
    const api: Partial<SearchApiIFC> = {};
    let getByText: BoundFunction<GetByText> = () => {
      throw new Error();
    };

    act(() => {
      ({ getByText } = render(
        wrapWithContext(
          <SimpleDocument
            document={customDoc}
            setHideToolbarControls={(): void => {}}
            setLoading={(): void => {}}
          />,
          api,
          context
        )
      ));
    });

    getByText(documentText);
  });
});
