import React from 'react';
import { act, render } from '@testing-library/react';
import omit from 'lodash/omit';
import { NoAuthAuthenticator } from 'ibm-watson/auth';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import DiscoverySearch from 'components/DiscoverySearch/DiscoverySearch';
import DocumentPreview from '../DocumentPreview';
import pdfDoc from '../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import passages from '../__fixtures__/passages';
import 'utils/test/createRange.mock';
import { SearchApiIFC, SearchContextIFC } from 'components/DiscoverySearch/DiscoverySearch';
import { wrapWithContext } from 'utils/testingUtils';

describe('DocumentPreview', () => {
  let getByText: NonNullable<any>, findAllByTestId: NonNullable<any>, findByText: NonNullable<any>;

  const api: Partial<SearchApiIFC> = {};
  let context: Partial<SearchContextIFC> = {};

  const mockedBbox = {
    x: 0,
    y: 0,
    width: 10,
    height: 12
  };

  const htmlTextDoc = {
    id: '1234567890',
    extracted_metadata: {
      filename: 'i_am_a_pdf_file.pdf',
      file_type: 'pdf'
    },
    text: 'Example text <text> <username> <password> more text afterwards.',
    body_field: 'Display text from the specified "body" field.'
  };

  const jsonDoc = {
    id: '1234567890',
    extracted_metadata: {
      filename: 'i_am_a_json_file.json',
      file_type: 'json'
    },
    html: '<p>This field should not get picked up.</p>',
    text: 'Hello, I am a text field.',
    body_field: 'Display text from the specified "body" field.'
  };

  const csvDoc = {
    id: '1234567890',
    extracted_metadata: {
      filename: 'i_am_a_csv_file.csv',
      file_type: 'csv'
    },
    column_1: 'This is column 1.',
    column_2: 'This is how a CSV file is processed.'
  };

  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    context.componentSettings = undefined;
  });

  // this is added since JSDOM does not support the getBBox function
  const originalGetBBox = (SVGElement.prototype as SVGTextElement).getBBox;
  beforeEach(
    () =>
      ((SVGElement.prototype as SVGTextElement).getBBox = (): any => {
        return mockedBbox;
      })
  );

  afterEach(() => ((SVGElement.prototype as SVGTextElement).getBBox = originalGetBBox));

  describe('PDF / HTML / Text files', () => {
    it('renders html field if available', async () => {
      act(() => {
        ({ getByText } = render(<DocumentPreview document={pdfDoc} />));
      });

      const docBbox = getByText('On 22 December 2008 ART EFFECTS LIMITED', { exact: false });
      expect(docBbox.getAttribute('page')).toEqual('1');
      expect(docBbox.getAttribute('height')).toEqual('85.87297201156616');
    });

    it('renders html field with single-line passage highlighting', async () => {
      act(() => {
        const highlight = passages.single;
        ({ findByText, findAllByTestId } = render(
          <DocumentPreview document={pdfDoc} highlight={highlight} />
        ));
      });

      const docBbox = await findByText('5.21 Miscellaneous Costs', { exact: false });
      expect(docBbox.getAttribute('page')).toEqual('13');
      expect(docBbox.getAttribute('height')).toEqual('60.19294881820679');

      const highlights = await findAllByTestId('field-rect');
      expect(highlights.length).toEqual(1);
      const highlightContainer = highlights[0].parentElement;
      expect(highlightContainer.getAttribute('data-field-type')).toEqual('highlight');
      expect(highlightContainer.getAttribute('data-field-id')).toEqual('54532');
    });

    it('renders html field with multi-line passage highlighting', async () => {
      act(() => {
        const highlight = passages.multiline;
        ({ findAllByTestId } = render(<DocumentPreview document={pdfDoc} highlight={highlight} />));
      });

      const highlights = await findAllByTestId('field-rect');
      expect(highlights.length).toEqual(3);
      const highlightContainer = highlights[0].parentElement;
      expect(highlightContainer.getAttribute('data-field-type')).toEqual('highlight');
      expect(highlightContainer.getAttribute('data-field-id')).toEqual('211003');
    });

    it('renders html field with table highlighting', async () => {
      const highlight = {
        table_id: 'c0b39e49-e4cf-4fae-97b0-d547b0af6bc2',
        source_document_id: '903461f8843ef9f10daecd2a14994308',
        collection_id: 'd1714ef9-647c-288c-0000-016fa082490f',
        table_html: 'Something',
        table_html_offset: 274502,
        table: {
          location: { begin: 274994, end: 279877 },
          text:
            'Section 7 - Agreed Rates Resource Type Day Rate Project Manager $550 Customer Delivery Manager $800 Product Analyst $800 Solution Architect $800 Technical Architect $800 Handset Developer $400 Server Developer $400 Tester /Test Analyst $400 Release Manager $400 Security Analyst $800 DBA $400 Senior Developer/Development Manager $800 Operations Manager $800 Infrastructure Architect $800 Senior Unix Developer $600 Unix Developer $400 Operations Staff $400 Security Office $400'
        }
      };

      act(() => {
        ({ findAllByTestId } = render(<DocumentPreview document={pdfDoc} highlight={highlight} />));
      });

      const highlights = await findAllByTestId('field-rect');
      expect(highlights.length).toEqual(1);
      const highlightContainer = highlights[0].parentElement;
      expect(highlightContainer.getAttribute('data-field-type')).toEqual('highlight');
      expect(highlightContainer.getAttribute('data-field-id')).toEqual('274994');
    });

    it('renders text field if html is unavailable and renders html like text', () => {
      act(() => {
        ({ getByText } = render(<DocumentPreview document={htmlTextDoc} />));
      });

      // Checks that it does not process html tags inside and that SimpleDocument was used
      const simpleDoc = getByText('<text> <username> <password>', { exact: false }).parentElement;
      expect(simpleDoc.classList.contains('bx--simple-document__content')).toBe(true);
    });

    it('renders text field with single-line passage highlighting', async () => {
      const highlight = {
        passage_text: 'more text afterwards.',
        start_offset: 41,
        end_offset: 62,
        field: 'text'
      };

      act(() => {
        ({ findAllByTestId } = render(
          <DocumentPreview document={htmlTextDoc} highlight={highlight} />
        ));
      });

      const highlights = await findAllByTestId('field-rect');
      expect(highlights.length).toEqual(1);
      const highlightContainer = highlights[0].parentElement;
      expect(highlightContainer.getAttribute('data-field-type')).toEqual('passage');
      expect(highlightContainer.getAttribute('data-field-id')).toEqual('41');
    });

    it('renders an overwritten "body" field', async () => {
      context = {
        componentSettings: {
          fields_shown: {
            body: {
              field: 'body_field'
            }
          }
        }
      };
      act(() => {
        ({ getByText } = render(
          wrapWithContext(<DocumentPreview document={htmlTextDoc} />, api, context)
        ));
      });

      getByText('Display text from the specified "body" field.');
    });

    it('renders with data from selected result', async () => {
      const authenticator = new NoAuthAuthenticator();
      const searchClient = new DiscoveryV2({
        ur: 'http://mock:3000/api',
        version: '2019-01-01',
        authenticator
      });
      const dummyResponse = {
        result: {},
        status: 200,
        statusText: 'OK',
        headers: {}
      };
      jest
        .spyOn(searchClient, 'listCollections')
        .mockImplementation(() => Promise.resolve(dummyResponse));
      jest
        .spyOn(searchClient, 'getComponentSettings')
        .mockImplementation(() => Promise.resolve(dummyResponse));

      const selectedResult = {
        document: omit(pdfDoc, 'extracted_metadata.text_mappings'),
        element: null,
        elementType: null
      };
      const results = {
        matching_results: 1,
        results: [selectedResult]
      };

      act(() => {
        ({ getByText } = render(
          <DiscoverySearch
            searchClient={searchClient}
            projectId={'PROJECT_ID'}
            overrideSearchResults={results}
            overrideSelectedResult={selectedResult}
          >
            <DocumentPreview />
          </DiscoverySearch>
        ));
      });
      getByText('On 22 December 2008 ART EFFECTS LIMITED', { exact: false });
    });
  });

  // All of these currently fail since DocumentPreview defaults to HtmlView if a HTML field is present.
  // Also fails because SimpleDocument will not show a JSON document without a passage highlight.
  // DocumentPreview JSON files do not preview if no passage highlight is specified
  describe.skip('JSON files', () => {
    it('renders text field for JSON files', async () => {
      act(() => {
        ({ getByText } = render(
          wrapWithContext(<DocumentPreview document={jsonDoc} />, api, context)
        ));
      });
      getByText('Hello, I am a text field.');
    });

    it('renders an overwritten "body" field for JSON files', async () => {
      context = {
        componentSettings: {
          fields_shown: {
            body: {
              field: 'body_field'
            }
          }
        }
      };
      act(() => {
        ({ getByText } = render(
          wrapWithContext(<DocumentPreview document={jsonDoc} />, api, context)
        ));
      });
      getByText('Display text from the specified "body" field.');
    });

    it('renders text from passage field, with passage highlighted', async () => {
      const highlight = {
        passage_text: 'Hello',
        start_offset: 0,
        end_offset: 4,
        field: 'text'
      };

      act(() => {
        ({ findAllByTestId } = render(
          <DocumentPreview document={jsonDoc} highlight={highlight} />
        ));
      });

      const highlights = await findAllByTestId('field-rect');
      expect(highlights.length).toEqual(1);
      const highlightContainer = highlights[0].parentElement;
      expect(highlightContainer.getAttribute('data-field-type')).toEqual('passage');
      expect(highlightContainer.getAttribute('data-field-id')).toEqual('0');
    });
  });

  describe('CSV files', () => {
    // Currently fails since no error message is displayed if there is an unspecified body field and passage
    it.skip('shows error if no "body" field or passage have been specified', () => {
      act(() => {
        ({ getByText } = render(<DocumentPreview document={csvDoc} />));
      });
      getByText('Cannot preview document');
    });

    it('renders specfied "body" field', () => {
      context = {
        componentSettings: {
          fields_shown: {
            body: {
              field: 'column_1'
            }
          }
        }
      };
      act(() => {
        ({ getByText } = render(
          wrapWithContext(<DocumentPreview document={csvDoc} />, api, context)
        ));
      });
      getByText('This is column 1.');
    });

    it('renders text from passage field, with passage highlighted', async () => {
      const highlight = {
        passage_text: 'CSV file',
        start_offset: 14,
        end_offset: 21,
        field: 'column_2'
      };

      act(() => {
        ({ findAllByTestId } = render(<DocumentPreview document={csvDoc} highlight={highlight} />));
      });

      const highlights = await findAllByTestId('field-rect');
      expect(highlights.length).toEqual(1);
      const highlightContainer = highlights[0].parentElement;
      expect(highlightContainer.getAttribute('data-field-type')).toEqual('passage');
      expect(highlightContainer.getAttribute('data-field-id')).toEqual('14');
    });
  });
});
