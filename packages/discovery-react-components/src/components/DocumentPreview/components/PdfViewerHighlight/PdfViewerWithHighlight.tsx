import React, { FC, useState, useCallback } from 'react';
import { QueryResult } from 'ibm-watson/discovery/v2';
import useAsyncFunctionCall from 'utils/useAsyncFunctionCall';
import PdfViewer, { PdfViewerProps } from '../PdfViewer/PdfViewer';
import { PdfRenderedText } from '../PdfViewer/PdfViewerTextLayer';
import { DocumentFieldHighlight } from './types';
import PdfViewerHighlight from './PdfViewerHighlight';
import { extractDocumentInfo } from './utils/common/documentUtils';

interface Props extends PdfViewerProps {
  /**
   * Class name to style each highlight
   */
  highlightClassName?: string;

  /**
   * Document data returned by query
   */
  document: QueryResult;

  /**
   * Highlight spans on fields in document
   */
  highlights: DocumentFieldHighlight[];

  /**
   * Consider bboxes in HTML field to highlight.
   * True by default. This is for testing purpose.
   */
  _useHtmlBbox?: boolean;
}

/**
 * PDF viewer component with text highlighting capability
 */
const PdfViewerWithHighlight: FC<Props> = ({
  highlightClassName,
  document,
  highlights,
  _useHtmlBbox,
  ...rest
}) => {
  const { page, scale } = rest;
  const [renderedText, setRenderedText] = useState<PdfRenderedText | null>(null);

  const documentInfo = useAsyncFunctionCall(
    useCallback(async () => await extractDocumentInfo(document), [document])
  );

  const highlightReady = !!documentInfo && !!renderedText;
  return (
    <PdfViewer {...rest} setRenderedText={setRenderedText}>
      <PdfViewerHighlight
        highlightClassName={highlightClassName}
        document={document}
        parsedDocument={highlightReady ? documentInfo : null}
        pdfRenderedText={highlightReady ? renderedText : null}
        page={page}
        highlights={highlights}
        scale={scale}
        _useHtmlBbox={_useHtmlBbox}
        _usePdfTextItem={true}
      />
    </PdfViewer>
  );
};

export default PdfViewerWithHighlight;
