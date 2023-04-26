import React from 'react';
import { act, render, BoundFunction, GetByText } from '@testing-library/react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import 'utils/test/createRange.mock';
import { wrapWithContext } from 'utils/testingUtils';
import docArrayJson from 'components/DocumentPreview/__fixtures__/ArtEffectsTextArray.json';
import { SearchApiIFC, SearchContextIFC } from 'components/DiscoverySearch/DiscoverySearch';
import SimpleDocument from '../SimpleDocument';

const noop = (): any => {
  throw new Error();
};

describe('SimpleDocument', () => {
  const minimalDoc = {
    id: '1234567890',
    extracted_metadata: {
      filename: 'i_am_a_file'
    }
  } as unknown as DiscoveryV2.QueryResult;

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
          loading={false}
          hideToolbarControls={false}
        />
      );
    });
  });

  it('renders with array wrapped text', () => {
    let getByText: BoundFunction<GetByText> = noop;

    const mock = jest.fn();
    expect(mock).not.toHaveBeenCalled();
    act(() => {
      ({ getByText } = render(
        <SimpleDocument
          document={docArrayJson as unknown as DiscoveryV2.QueryResult}
          setLoading={(): void => {}}
          setHideToolbarControls={(): void => mock('setHideToolbarControls called')}
          loading={false}
          hideToolbarControls={false}
        />
      ));
    });
    expect(mock).toHaveBeenCalled();
    getByText(
      'services) for its business operations and to meet obligations in connection with transactions under the Prime-Contract. This',
      { exact: false }
    );
  });

  it('renders a document with a different body field', () => {
    const documentText = 'This is the text of the document.';
    const customDoc = {
      body_field: documentText
    } as unknown as DiscoveryV2.QueryResult;
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
            loading={false}
            hideToolbarControls={false}
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
    } as unknown as DiscoveryV2.QueryResult;

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
            loading={false}
            hideToolbarControls={false}
          />,
          api,
          context
        )
      ));
    });

    getByText(passageText);
  });

  it('renders a fallback component when nothing to display in document', () => {
    const jsonDoc = {
      document_id: '1234567890',
      extracted_metadata: {
        filename: 'i_am_a_file',
        file_type: 'json'
      },
      result_metadata: {
        collection_id: '1234'
      }
    };

    const { getByText } = render(
      <SimpleDocument
        document={jsonDoc}
        setHideToolbarControls={(): void => {}}
        setLoading={(): void => {}}
        fallbackComponent={({ document }) => <div>JSON: {JSON.stringify(document)}</div>}
        hideToolbarControls
        loading
      />
    );

    const errorText = `JSON: ${JSON.stringify(jsonDoc)}`;
    getByText(errorText);
  });
});
