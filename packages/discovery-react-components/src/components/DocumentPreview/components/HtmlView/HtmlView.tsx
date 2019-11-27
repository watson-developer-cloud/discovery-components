import React, { FC } from 'react';
import { QueryResult } from 'ibm-watson/discovery/v2';
import DOMPurify from 'dompurify';
import get from 'lodash/get';

interface Props {
  /**
   * Document data returned by query
   */
  document: QueryResult;
  /**
   * Check to disable toolbar in parent
   */
  setLoading: (loading: boolean) => void;
  /**
   * Callback which is invoked with whether to enable/disable toolbar controls
   */
  setHideToolbarControls?: (disabled: boolean) => void;
}

export const HtmlView: FC<Props> = ({ document, setHideToolbarControls, setLoading }) => {
  if (setHideToolbarControls) {
    setHideToolbarControls(true);
  }

  const html = document ? DOMPurify.sanitize(get(document, 'html')) : '';

  setLoading(false);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: html
      }}
    />
  );
};

export default HtmlView;
