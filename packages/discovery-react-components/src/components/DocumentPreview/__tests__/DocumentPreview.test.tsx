import React from 'react';
import { act, render, BoundFunction, GetByText, FindAllBy } from '@testing-library/react';
import omit from 'lodash/omit';
import { NoAuthAuthenticator } from 'ibm-watson/auth';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import DiscoverySearch from 'components/DiscoverySearch/DiscoverySearch';
import DocumentPreview from '../DocumentPreview';
import pdfDocument from '../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import passages from '../__fixtures__/passages';
import 'utils/test/createRange.mock';
import { SearchApiIFC, SearchContextIFC } from 'components/DiscoverySearch/DiscoverySearch';
import { wrapWithContext } from 'utils/testingUtils';

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
  let getByText: BoundFunction<GetByText>, findAllByTestId: BoundFunction<FindAllBy<any[]>>;
  const api: Partial<SearchApiIFC> = {};
  let context: Partial<SearchContextIFC> = {};

  const mockedBbox = {
    x: 0,
    y: 0,
    width: 10,
    height: 12
  };

  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  // This is added since JSDOM does not support the getBBox function
  const originalGetBBox = (SVGElement.prototype as SVGTextElement).getBBox;
  beforeEach(() => {
    (SVGElement.prototype as SVGTextElement).getBBox = (): any => {
      return mockedBbox;
    };
    // This is added since the context needs to be reset to defaults for renders not wrappedWithContext
    if (context.componentSettings) {
      context.componentSettings.fields_shown!.body = undefined;
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
      act(() => {
        ({ getByText } = render(<DocumentPreview document={pdfDoc} />));
      });

      getByText('This is a string.');
      getByText('HTML');
    });

    it('should render html field with single-line passage highlighting', async () => {
      act(() => {
        const highlight = passages.single;
        ({ findAllByTestId } = render(
          <DocumentPreview document={pdfDocument} highlight={highlight} />
        ));
      });

      const highlights = await findAllByTestId('field-rect');
      (expect(highlights) as any).toBeValidHighlight(1, 'highlight', 54532);
    });

    it('should render html field with multi-line passage highlighting', async () => {
      act(() => {
        const highlight = passages.multiline;
        ({ findAllByTestId } = render(
          <DocumentPreview document={pdfDocument} highlight={highlight} />
        ));
      });

      const highlights = await findAllByTestId('field-rect');
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
      act(() => {
        ({ findAllByTestId } = render(
          <DocumentPreview document={pdfDocument} highlight={highlight} />
        ));
      });

      const highlights = await findAllByTestId('field-rect');
      (expect(highlights) as any).toBeValidHighlight(
        1,
        'highlight',
        highlight.table.location.begin
      );
    });

    it('should render text field if html is unavailable', () => {
      act(() => {
        ({ getByText } = render(<DocumentPreview document={omit(pdfDoc, 'html')} />));
      });

      getByText('This is simple text.');
    });

    it('should render html like text', () => {
      pdfDoc.text = 'This text field has <text> <username> <password> HTML elements.';
      act(() => {
        ({ getByText } = render(<DocumentPreview document={omit(pdfDoc, 'html')} />));
      });

      // Checks that it does not process html tags inside
      getByText('<text> <username> <password>', { exact: false });
    });

    it('should render text field with single-line passage highlighting', async () => {
      const highlight = {
        passage_text: 'simple text.',
        start_offset: 8,
        end_offset: 19,
        field: 'text'
      };
      act(() => {
        ({ findAllByTestId } = render(
          <DocumentPreview document={omit(pdfDoc, 'html')} highlight={highlight} />
        ));
      });

      const highlights = await findAllByTestId('field-rect');
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
      act(() => {
        ({ getByText } = render(
          wrapWithContext(<DocumentPreview document={omit(pdfDoc, 'html')} />, api, context)
        ));
      });

      getByText('I am a specified "body" field.');
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
      act(() => {
        ({ getByText } = render(<DocumentPreview document={omit(jsonDoc, 'text', 'html')} />));
      });

      getByText('Cannot preview document');
    });

    it('should render text field for JSON files', () => {
      act(() => {
        ({ getByText } = render(<DocumentPreview document={jsonDoc} />));
      });

      getByText('This is simple text.');
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
      act(() => {
        ({ getByText } = render(
          wrapWithContext(<DocumentPreview document={jsonDoc} />, api, context)
        ));
      });

      getByText('I am a specified "body" field.');
    });

    it('shoulder render text from passage field, with passage highlighted', async () => {
      const highlight = {
        passage_text: 'simple text.',
        start_offset: 8,
        end_offset: 19,
        field: 'text'
      };
      act(() => {
        ({ findAllByTestId } = render(
          <DocumentPreview document={jsonDoc} highlight={highlight} />
        ));
      });

      const highlights = await findAllByTestId('field-rect');
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
    // TODO: Currently fails since no error message is displayed if there is an unspecified body field and passage
    it.skip('should show an error if no "body" field or passage have been specified', () => {
      act(() => {
        ({ getByText } = render(<DocumentPreview document={csvDoc} />));
      });

      getByText('Cannot preview document');
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
      act(() => {
        ({ getByText } = render(
          wrapWithContext(<DocumentPreview document={csvDoc} />, api, context)
        ));
      });

      getByText('This is a specified body field.');
    });

    it('shoulder render text from passage field, with passage highlighted', async () => {
      const highlight = {
        passage_text: 'highlighted field.',
        start_offset: 9,
        end_offset: 27,
        field: 'column_2'
      };
      act(() => {
        ({ findAllByTestId } = render(<DocumentPreview document={csvDoc} highlight={highlight} />));
      });

      const highlights = await findAllByTestId('field-rect');
      (expect(highlights) as any).toBeValidHighlight(1, 'passage', highlight.start_offset);
    });
  });
});
