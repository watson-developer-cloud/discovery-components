import React, { FC, useState, useCallback } from 'react';
import useAsyncFunctionCall from 'utils/useAsyncFunctionCall';
import PdfViewer, { PdfViewerProps } from '../PdfViewer/PdfViewer';
import { PdfRenderedText } from '../PdfViewer/PdfViewerTextLayer';
import PdfViewerHighlight from './PdfViewerHighlight';
import { extractDocumentInfo } from './utils/common/documentUtils';
import { HighlightProps } from './types';

type Props = PdfViewerProps & HighlightProps;

/**
 * PDF viewer component with text highlighting capability
 */
const PdfViewerWithHighlight: FC<Props> = ({
  highlightClassName,
  document,
  highlights,
  _useHtmlBbox,
  _usePdfTextItem,
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
        _usePdfTextItem={_usePdfTextItem}
      />
    </PdfViewer>
  );
};

export default PdfViewerWithHighlight;
