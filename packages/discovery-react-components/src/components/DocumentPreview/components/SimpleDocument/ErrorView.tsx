import { FC, ReactNode } from 'react';
import { settings } from 'carbon-components';
import { ReactComponent as DocumentPreviewIcon } from './icons/document_preview.svg';

type ErrorViewProps = {
  header: ReactNode;
  message: ReactNode;
};

const ErrorView: FC<ErrorViewProps> = ({ header, message }) => {
  const baseClass = `${settings.prefix}--simple-document__error-view`;
  return (
    <div className={baseClass} data-testid="error_state">
      <div className={`${baseClass}__icon`}>
        <DocumentPreviewIcon />
      </div>
      <div>
        <h1 className={`${baseClass}__header`}>{header}</h1>
        <div className={`${baseClass}__message`}>{message}</div>
      </div>
    </div>
  );
};

export default ErrorView;
