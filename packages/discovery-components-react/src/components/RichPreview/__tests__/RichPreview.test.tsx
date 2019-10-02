import * as React from 'react';
import { act, render } from '@testing-library/react';
import RichPreview from '../RichPreview';
import { document as doc1 } from '../__fixtures__/intro_to_watson_discovery.pdf';
import doc2Json from '../__fixtures__/WEA.Glossary.pdf.json';
import passages from '../__fixtures__/passages';

describe('RichPreview', () => {
  it('renders with file data without crashing', () => {
    act(() => {
      render(<RichPreview file={atob(doc1)} />);
    });
  });

  it('renders with document data (fallback) without crashing', () => {
    act(() => {
      render(<RichPreview document={doc2Json} />);
    });
  });

  it('renders with passage data without crashing', () => {
    act(() => {
      // inject single-line passage
      const doc = {
        ...doc2Json,
        document_passages: [passages.single]
      };
      render(<RichPreview document={doc} />);
    });
  });
});
