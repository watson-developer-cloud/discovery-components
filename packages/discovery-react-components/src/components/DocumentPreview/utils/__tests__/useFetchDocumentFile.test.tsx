import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import document from 'components/DocumentPreview/__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import { useFetchDocumentFile } from '../useFetchDocumentFile';
import { DocumentFile } from '../../types';

type Props = {
  file?: DocumentFile;
  fetchTimeout?: number;
};

describe('useFetchDocumentFile', () => {
  const DummyChild = ({ file, fetchTimeout }: Props) => {
    const { providedFile, isFetching } = useFetchDocumentFile({
      file,
      document,
      fetchTimeout
    });
    return (
      <>
        <div data-testid="provided_file">{`${providedFile}`}</div>
        <div data-testid="fetching">{`${isFetching}`}</div>
      </>
    );
  };

  const fetchedFileContent = 'Fetched file content';
  const fetchFileTime = 1000;

  const setup = ({ file, fetchTimeout }: Props) => {
    render(
      <SearchContext.Provider
        value={
          {
            selectedResult: {},
            documentProvider: {
              get: async () =>
                new Promise(resolve =>
                  setTimeout(() => resolve(fetchedFileContent), fetchFileTime)
                ),
              provides: () => true
            }
          } as any
        }
      >
        <DummyChild file={file} fetchTimeout={fetchTimeout} />
      </SearchContext.Provider>
    );
  };

  it('should return the file prop as it is', () => {
    const file = 'Dummy file data';
    setup({ file });

    expect(screen.getByTestId('provided_file')).toHaveTextContent(file);
    expect(screen.getByTestId('fetching')).toHaveTextContent('false');
  });

  it('should return the fetched file when no file prop', async () => {
    setup({});

    expect(screen.getByTestId('fetching')).toHaveTextContent('true');
    await waitFor(
      () => {
        expect(screen.getByTestId('provided_file')).toHaveTextContent(fetchedFileContent);
        expect(screen.getByTestId('fetching')).toHaveTextContent('false');
      },
      {
        timeout: fetchFileTime + 1000 // must be grater than fetchFileTime
      }
    );
  });

  it('should return undefined when the fetchTimeout is exceeded', async () => {
    const fetchTimeout = 500;
    setup({ fetchTimeout });

    expect(screen.getByTestId('fetching')).toHaveTextContent('true');
    await waitFor(
      () => {
        expect(screen.getByTestId('provided_file')).toHaveTextContent('undefined');
        expect(screen.getByTestId('fetching')).toHaveTextContent('false');
      },
      {
        timeout: fetchTimeout + 1000 // must be grater than fetchTimeout
      }
    );
  });
});
