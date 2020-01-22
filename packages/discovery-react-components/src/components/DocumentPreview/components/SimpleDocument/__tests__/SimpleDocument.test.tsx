import React from 'react';
import { act, render, BoundFunction, GetByText } from '@testing-library/react';
import 'utils/test/createRange.mock';
import SimpleDocument from '../SimpleDocument';
import docArrayJson from 'components/DocumentPreview/__fixtures__/ArtEffectsTextArray.json';
import { SearchApiIFC, SearchContextIFC } from 'components/DiscoverySearch/DiscoverySearch';
import { wrapWithContext } from 'utils/testingUtils';

const noop = (): any => {
  throw new Error();
};

describe('SimpleDocument', () => {
  const minimalDoc = {
    id: '1234567890',
    extracted_metadata: {
      filename: 'i_am_a_file'
    }
  };

  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

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
    let getByText: BoundFunction<GetByText> = noop;

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
            field: 'body_field'
          }
        }
      }
    };
    const api: Partial<SearchApiIFC> = {};
    let getByText: BoundFunction<GetByText> = noop;

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

  it('renders document using passage field even if different body field specified', () => {
    const passageText = 'This is the text of the document.';
    const bodyText = 'This is the body text.';

    const customDoc = {
      body_field: bodyText,
      passage_field: passageText
    };

    const context: Partial<SearchContextIFC> = {
      componentSettings: {
        fields_shown: {
          body: {
            field: 'body_field'
          }
        }
      }
    };

    const highlight = {
      passage_text: passageText,
      start_offset: 0,
      end_offset: 32,
      field: 'passage_field'
    };

    const api: Partial<SearchApiIFC> = {};
    let getByText: BoundFunction<GetByText> = noop;

    act(() => {
      ({ getByText } = render(
        wrapWithContext(
          <SimpleDocument
            document={customDoc}
            highlight={highlight}
            setHideToolbarControls={(): void => {}}
            setLoading={(): void => {}}
          />,
          api,
          context
        )
      ));
    });

    getByText(passageText);
  });
});
