import React from 'react';
import { act, render } from '@testing-library/react';
import omit from 'lodash/omit';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import { DiscoverySearch } from '../../DiscoverySearch/DiscoverySearch';
import DocumentPreview from '../DocumentPreview';
import { document as doc } from '../__fixtures__/Art Effects.pdf';
import docJson from '../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import passages from '../__fixtures__/passages';

describe('DocumentPreview', () => {
  it('renders with file data without crashing', () => {
    act(() => {
      render(<DocumentPreview document={docJson} file={atob(doc)} />);
    });
  });

  it('renders with document data (fallback) without crashing', () => {
    act(() => {
      render(<DocumentPreview document={docJson} />);
    });
  });

  it('renders with passage data without crashing', () => {
    act(() => {
      // inject single-line passage
      const doc = {
        ...docJson,
        document_passages: [passages.single]
      };
      render(<DocumentPreview document={doc} />);
    });
  });

  it('renders with data from selected result', async () => {
    const searchClient = new DiscoveryV1({
      ur: 'http://mock:3000/api',
      version: '2019-01-01',
      use_unauthenticated: true
    });
    jest.spyOn(searchClient, 'listCollections').mockImplementation(() => Promise.resolve({}));

    const selectedResult = omit(docJson, 'extracted_metadata.text_mappings');
    const results = {
      matching_results: 1,
      results: [selectedResult]
    };

    let getByText: NonNullable<any>;
    act(() => {
      ({ getByText } = render(
        <DiscoverySearch
          searchClient={searchClient}
          projectId={'PROJECT_ID'}
          searchResults={results}
          selectedResult={selectedResult}
        >
          <DocumentPreview />
        </DiscoverySearch>
      ));
    });

    getByText('On 22 December 2008 ART EFFECTS LIMITED', { exact: false });
  });
});
