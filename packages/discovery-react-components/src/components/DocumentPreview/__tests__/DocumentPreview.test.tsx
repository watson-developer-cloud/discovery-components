import React from 'react';
import { render, screen } from '@testing-library/react';
import omit from 'lodash/omit';
import { NoAuthAuthenticator } from 'ibm-watson/auth';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import DiscoverySearch from 'components/DiscoverySearch/DiscoverySearch';
import DocumentPreview from '../DocumentPreview';
import pdfDocument from '../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import { document as pdfContentDocument } from '../__fixtures__/Art Effects.pdf';
import { document as pdfContentInvalidDocument } from '../__fixtures__/Art Effects invalid.pdf';
import passages from '../__fixtures__/passages';
import 'utils/test/createRange.mock';
import { SearchApiIFC, SearchContextIFC } from 'components/DiscoverySearch/DiscoverySearch';
import { wrapWithContext } from 'utils/testingUtils';

// PDF.js uses web streams, which aren't defined in jest/JSDOM
import 'web-streams-polyfill/es2018';

// Increased timeout for long-running tests
const THIRTY_SECONDS = 30000;

expect.extend({
  toBeValidHighlight(highlights, length, fieldType, fieldId) {
    if (highlights.length === length) {
      const highlightContainer = highlights[0].parentElement;
      return {
        message: () => `expected highlight to be of type ${fieldType} with id ${fieldId}`,
        pass:
          highlightContainer!.getAttribute('data-field-type') === fieldType &&
          highlightContainer!.getAttribute('data-field-id') === fieldId.toString()
      };
    }
    return {
      message: () => `expected ${length} highlights but recieved ${highlights.length}`,
      pass: false
    };
  }
});

describe('DocumentPreview', () => {
  const api: Partial<SearchApiIFC> = {};
  let context: Partial<SearchContextIFC> = {};

  const mockedBbox = {
    x: 0,
    y: 0,
    width: 10,
    height: 12
  };

  // This is added since JSDOM does not support the getBBox function
  const originalGetBBox = (SVGElement.prototype as SVGTextElement).getBBox;
  beforeEach(() => {
    (SVGElement.prototype as SVGTextElement).getBBox = (): any => {
      return mockedBbox;
    };
    // This is added since the context needs to be reset to defaults for renders not wrappedWithContext
    if (
      context.componentSettings &&
      context.componentSettings.fields_shown &&
      context.componentSettings.fields_shown.body
    ) {
      context.componentSettings.fields_shown.body = undefined;
    }
  });

  afterEach(() => ((SVGElement.prototype as SVGTextElement).getBBox = originalGetBBox));

  const pdfDoc = {
    id: '1234567890',
    extracted_metadata: {
      filename: 'i_am_a_pdf_file.pdf',
      file_type: 'pdf'
    },
    html: '<p>This is a <em>HTML</em> string.</p>',
    text: 'This is simple text.',
    body_field: 'I am a specified "body" field.'
  };

  describe('with PDF / HTML / Text files', () => {
    it('should render html field if available', () => {
      render(<DocumentPreview document={pdfDoc} />);

      screen.getByText('This is a string.');
      screen.getByText('HTML');
    });

    it('should render html field with single-line passage highlighting', async () => {
      const highlight = passages.single;
      render(<DocumentPreview document={pdfDocument} highlight={highlight} />);

      const highlights = await screen.findAllByTestId('field-rect');
      (expect(highlights) as any).toBeValidHighlight(1, 'highlight', 54532);
    });

    it('should render html field with multi-line passage highlighting', async () => {
      const highlight = passages.multiline;
      render(<DocumentPreview document={pdfDocument} highlight={highlight} />);

      const highlights = await screen.findAllByTestId('field-rect');
      (expect(highlights) as any).toBeValidHighlight(3, 'highlight', 211003);
    });

    it('should render html field with table highlighting', async () => {
      const highlight = {
        table_html: 'Something',
        table_html_offset: 274502,
        table: {
          location: { begin: 274994, end: 279877 },
          text: 'Section 7 - Agreed Rates Resource Type Day Rate Project Manager $550'
        }
      };
      render(<DocumentPreview document={pdfDocument} highlight={highlight} />);

      const highlights = await screen.findAllByTestId('field-rect');
      (expect(highlights) as any).toBeValidHighlight(
        1,
        'highlight',
        highlight.table.location.begin
      );
    });

    it('should render text field if html is unavailable', () => {
      render(<DocumentPreview document={omit(pdfDoc, 'html')} />);

      screen.getByText('This is simple text.');
    });

    it('should render html like text', () => {
      pdfDoc.text = 'This text field has <text> <username> <password> HTML elements.';
      render(<DocumentPreview document={omit(pdfDoc, 'html')} />);

      // Checks that it does not process html tags inside
      screen.getByText('<text> <username> <password>', { exact: false });
    });

    it('should render text field with single-line passage highlighting', async () => {
      const highlight = {
        passage_text: 'simple text.',
        start_offset: 8,
        end_offset: 19,
        field: 'text'
      };
      render(<DocumentPreview document={omit(pdfDoc, 'html')} highlight={highlight} />);

      const highlights = await screen.findAllByTestId('field-rect');
      (expect(highlights) as any).toBeValidHighlight(1, 'passage', highlight.start_offset);
    });

    it('should render an overwritten "body" field', () => {
      context = {
        componentSettings: {
          fields_shown: {
            body: {
              field: 'body_field'
            }
          }
        }
      };
      render(wrapWithContext(<DocumentPreview document={omit(pdfDoc, 'html')} />, api, context));

      screen.getByText('I am a specified "body" field.');
    });

    it('should render with data from selected result', async () => {
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
        document: omit(pdfDocument, 'extracted_metadata.text_mappings'),
        element: null,
        elementType: null
      };
      const results = {
        matching_results: 1,
        results: [selectedResult]
      } as unknown as DiscoveryV2.QueryResponse;

      render(
        <DiscoverySearch
          searchClient={searchClient}
          projectId={'PROJECT_ID'}
          overrideSearchResults={results}
          overrideSelectedResult={selectedResult}
        >
          <DocumentPreview />
        </DiscoverySearch>
      );

      const elem = await screen.findByText('On 22 December 2008 ART EFFECTS LIMITED', {
        exact: false
      });
      expect(elem).toBeInTheDocument();
    });

    it(
      'should render pdf',
      async () => {
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
          document: pdfDocument,
          element: null,
          elementType: null
        };
        const results = {
          matching_results: 1,
          results: [selectedResult]
        } as unknown as DiscoveryV2.QueryResponse;

        render(
          <DiscoverySearch
            searchClient={searchClient}
            projectId={'PROJECT_ID'}
            overrideSearchResults={results}
            overrideSelectedResult={selectedResult}
          >
            <DocumentPreview file={atob(pdfContentDocument)} />
          </DiscoverySearch>
        );

        // 58 pages evidence PDF rendered
        const elem = await screen.findByText('58 pages', {
          exact: false
        });
        expect(elem).toBeInTheDocument();
      },
      THIRTY_SECONDS
    );

    it('should render html when pdf is invalid', async () => {
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
        document: pdfDocument,
        element: null,
        elementType: null
      };
      const results = {
        matching_results: 1,
        results: [selectedResult]
      } as unknown as DiscoveryV2.QueryResponse;

      render(
        <DiscoverySearch
          searchClient={searchClient}
          projectId={'PROJECT_ID'}
          overrideSearchResults={results}
          overrideSelectedResult={selectedResult}
        >
          <DocumentPreview file={pdfContentInvalidDocument} />
        </DiscoverySearch>
      );

      // Evidence HTML rendered
      const elem = await screen.findByText('On 22 December 2008 ART EFFECTS LIMITED', {
        exact: false
      });
      expect(elem).toBeInTheDocument();
    });
  });

  const jsonDoc = {
    id: '1234567890',
    extracted_metadata: {
      filename: 'i_am_a_json_file.json',
      file_type: 'json'
    },
    html: '<p>This is a <em>HTML</em> string.</p>',
    text: 'This is simple text.',
    body_field: 'I am a specified "body" field.'
  };

  describe('with JSON files', () => {
    it('should show an error if no text field exists and no "body" field or passage has been specified', () => {
      const errorJsonDoc = omit(jsonDoc, 'html', 'text');
      render(<DocumentPreview document={errorJsonDoc} />);

      screen.getByText("Can't preview document");
    });

    it('should render text field for JSON files', () => {
      render(<DocumentPreview document={jsonDoc} />);

      screen.getByText('This is simple text.');
    });

    it('should render an overwritten "body" field for JSON files', () => {
      context = {
        componentSettings: {
          fields_shown: {
            body: {
              field: 'body_field'
            }
          }
        }
      };
      render(wrapWithContext(<DocumentPreview document={jsonDoc} />, api, context));

      screen.getByText('I am a specified "body" field.');
    });

    it('shoulder render text from passage field, with passage highlighted', async () => {
      const highlight = {
        passage_text: 'simple text.',
        start_offset: 8,
        end_offset: 19,
        field: 'text'
      };
      render(<DocumentPreview document={jsonDoc} highlight={highlight} />);

      const highlights = await screen.findAllByTestId('field-rect');
      (expect(highlights) as any).toBeValidHighlight(1, 'passage', highlight.start_offset);
    });
  });

  const csvDoc = {
    id: '1234567890',
    extracted_metadata: {
      filename: 'i_am_a_csv_file.csv',
      file_type: 'csv'
    },
    column_1: 'This is a specified body field.',
    column_2: 'This is a highlighted field.'
  };

  describe('with CSV files', () => {
    it('should show an error if no "body" field or passage have been specified', () => {
      render(<DocumentPreview document={csvDoc} />);

      screen.getByText("Can't preview document");
    });

    it('should render specfied "body" field', () => {
      context = {
        componentSettings: {
          fields_shown: {
            body: {
              field: 'column_1'
            }
          }
        }
      };
      render(wrapWithContext(<DocumentPreview document={csvDoc} />, api, context));

      screen.getByText('This is a specified body field.');
    });

    it('shoulder render text from passage field, with passage highlighted', async () => {
      const highlight = {
        passage_text: 'highlighted field.',
        start_offset: 9,
        end_offset: 27,
        field: 'column_2'
      };
      render(<DocumentPreview document={csvDoc} highlight={highlight} />);

      const highlights = await screen.findAllByTestId('field-rect');
      (expect(highlights) as any).toBeValidHighlight(1, 'passage', highlight.start_offset);
    });
  });
});
