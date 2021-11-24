import React, { FC, useState, useEffect } from 'react';
import { DocumentFieldHighlight } from './types';
import PdfViewer, { PdfViewerProps } from '../PdfViewer/PdfViewer';
import PdfViewerHighlight from './PdfViewerHighlight';
import { extractDocumentInfo, ExtractedDocumentInfo } from './utils/common/documentUtils';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { PdfRenderedText } from '../PdfViewer/PdfViewerTextLayer';

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
  useHtmlBbox?: boolean;
}

/**
 * PDF viewer component with text highlighting capability
 */
const PdfViewerWithHighlight: FC<Props> = ({
  highlightClassName,
  document,
  highlights,
  useHtmlBbox,
  ...rest
}) => {
  const { page, scale } = rest;
  const [renderedText, setRenderedText] = useState<PdfRenderedText | null>(null);

  const [documentInfo, setDocumentInfo] = useState<ExtractedDocumentInfo | null>(null);
  useEffect(() => {
    let cancelled = false;
    const extractDocInfo = async () => {
      const info = await extractDocumentInfo(document);
      if (!cancelled) {
        setDocumentInfo(info);
      }
    };
    extractDocInfo();
    return () => {
      cancelled = true;
    };
  }, [document]);

  const highlightReady = !!documentInfo && !!renderedText;
  return (
    <PdfViewer {...rest} setRenderedText={setRenderedText} showTextLayer>
      <PdfViewerHighlight
        highlightClassName={highlightClassName}
        document={document}
        parsedDocument={highlightReady ? documentInfo : null}
        pdfRenderedText={highlightReady ? renderedText : null}
        pageNum={page}
        highlights={highlights}
        scale={scale}
        useHtmlBbox={useHtmlBbox}
        usePdfTextItem={true}
      />
    </PdfViewer>
  );
};

export default PdfViewerWithHighlight;
