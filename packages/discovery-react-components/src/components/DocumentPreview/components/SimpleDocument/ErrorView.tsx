import React from 'react';
import { settings } from 'carbon-components';
import { ReactComponent as DocumentPreviewIcon } from './icons/document_preview.svg';

const ErrorState = () => {
  const base = `${settings.prefix}--simple-document__error-view`;
  return (
    <div className={base} data-testid="error_state">
      <div className={`${base}__icon`}>
        <DocumentPreviewIcon />
      </div>
      <div>
        <h1 className={`${base}__header`}>Can’t preview document</h1>
        <div className={`${base}__message`}>
          Try the JSON tab for a different view of this document's data.
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
