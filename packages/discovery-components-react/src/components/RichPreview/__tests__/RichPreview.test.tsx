import * as React from 'react';
import { act, render } from '@testing-library/react';
import RichPreview from '../RichPreview';
import { document as doc } from '../__fixtures__/WEA.Glossary_pdf';
import docJson from '../__fixtures__/WEA.Glossary.pdf.json';
import passages from '../__fixtures__/passages';

describe('RichPreview', () => {
  it('renders with file data without crashing', () => {
    act(() => {
      render(<RichPreview document={docJson} file={atob(doc)} />);
    });
  });

  it('renders with document data (fallback) without crashing', () => {
    act(() => {
      render(<RichPreview document={docJson} />);
    });
  });

  it('renders with passage data without crashing', () => {
    act(() => {
      // inject single-line passage
      const doc = {
        ...docJson,
        document_passages: [passages.single]
      };
      render(<RichPreview document={doc} />);
    });
  });
});
