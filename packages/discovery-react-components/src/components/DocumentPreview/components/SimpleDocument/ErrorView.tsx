import React, { FC, ReactNode } from 'react';
import { settings } from 'carbon-components';
import { ReactComponent as DocumentPreviewIcon } from './icons/document_preview.svg';

type ErrorStateProps = {
  header: ReactNode;
  message: ReactNode;
};

const ErrorState: FC<ErrorStateProps> = ({ header, message }) => {
  const base = `${settings.prefix}--simple-document__error-view`;
  return (
    <div className={base} data-testid="error_state">
      <div className={`${base}__icon`}>
        <DocumentPreviewIcon />
      </div>
      <div>
        <h1 className={`${base}__header`}>{header}</h1>
        <div className={`${base}__message`}>{message}</div>
      </div>
    </div>
  );
};

export default ErrorState;
