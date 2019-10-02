import React, { SFC } from 'react';
import get from 'lodash/get';
import { settings } from 'carbon-components';
import PdfViewer from './components/PdfViewer/PdfViewer';
import PassageHighlight from './components/PassageHighlight/PassageHighlight';

interface Props {
  /**
   * Document data returned by query
   */
  document?: any; // TODO should be `QueryResult`? but `title` props mismatch

  /**
   * PDF file data as base64-encoded string
   */
  file?: string;
}

export const RichPreview: SFC<Props> = ({ document, file }) => {
  const base = `${settings.prefix}--rich-preview`;
  // Only look for first passage, if available
  const passage = get(document, 'document_passages[0]');

  return (
    <div className={`${base}`}>
      <div className={`${base}__toolbar`}>TOOLBAR</div>
      <div className={`${base}__document`}>
        {/* if we have PDF data, render that */}
        {/* otherwise, render fallback document view */}
        {file ? <PdfViewer file={file} page={1} scale={1} /> : document && <div>FALLBACK</div>}
        {/* highlight passage on top of document view */}
        <div className={`${base}__passage`}>
          <PassageHighlight
            highlightClassname={`${base}__highlight`}
            document={document}
            passage={passage}
          />
        </div>
      </div>
    </div>
  );
};

export default RichPreview;
