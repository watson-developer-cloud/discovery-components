import React, { FC, useState, useEffect } from 'react';
import { PDFSource } from 'pdfjs-dist';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { DocumentFieldHighlight } from './types';
import PdfViewer from '../PdfViewer/PdfViewer';
import PdfViewerHighlight from './PdfViewerHighlight';
import { extractDocumentInfo, ExtractedDocumentInfo } from './utils/common/documentUtils';

interface Props {
  className?: string;
  highlightClassName?: string;

  /**
   * PDF file data as base64-encoded string
   */
  file: string;

  /**
   * Page number, starting at 1
   */
  page: number;

  /**
   * Zoom factor, where `1` is equal to 100%
   */
  scale: number;

  /**
   * Options passed to PdfJsLib.getDocument
   */
  pdfLoadOptions?: PDFSource;

  /**
   * Callback invoked with page count, once `file` has been parsed
   */
  setPageCount?: (count: number) => void;
  /**
   * Check if document is loading
   */
  setLoading?: (loading: boolean) => void;
  /**
   * Callback which is invoked with whether to enable/disable toolbar controls
   */
  setHideToolbarControls?: (disabled: boolean) => void;

  /**
   * A document
   */
  document: QueryResult;

  /**
   * Highlight
   */
  highlights: DocumentFieldHighlight[];

  /**
   * Consider bboxes in HTML field to highlight (internal)
   */
  useHtmlBbox?: boolean;
}

const PdfViewerWithHighlight: FC<Props> = ({
  highlightClassName,
  document,
  highlights,
  useHtmlBbox,
  ...rest
}) => {
  const { page, scale } = rest;
  const [textLayerInfo, setTextLayerInfo] = useState<any>();

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

  const highlightReady = !!documentInfo && !!textLayerInfo;
  return (
    <PdfViewer {...rest} setTextLayerInfo={setTextLayerInfo} showTextLayer>
      <PdfViewerHighlight
        highlightClassName={highlightClassName}
        document={document}
        documentInfo={highlightReady ? documentInfo : null}
        pdfTextLayerInfo={highlightReady ? textLayerInfo : null}
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
