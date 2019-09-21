import React, { SFC } from 'react';
import PdfViewer from './components/PdfViewer/PdfViewer';

interface Props {
  /**
   * PDF file data as base64-encoded string
   */
  file: string;
}

export const RichPreview: SFC<Props> = ({ file }) => <PdfViewer file={file} page={1} scale={1} />;

export default RichPreview;
