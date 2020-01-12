import React, { FC, useMemo } from 'react';
import { settings } from 'carbon-components';
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

export const canRenderHtmlView = (document?: QueryResult) => get(document, 'html');

const SANITIZE_CONFIG = {
  ADD_TAGS: ['bbox'],
  ADD_ATTR: [
    // bbox
    'page'
  ],
  WHOLE_DOCUMENT: true
};

const base = `${settings.prefix}--html`;

export const HtmlView: FC<Props> = ({ document, setHideToolbarControls, setLoading }) => {
  if (setHideToolbarControls) {
    setHideToolbarControls(true);
  }

  const docHtml = get(document, 'html');
  const html = useMemo(() => (docHtml ? DOMPurify.sanitize(docHtml, SANITIZE_CONFIG) : ''), [
    docHtml
  ]);

  setLoading(false);

  return (
    <div
      className={base}
      dangerouslySetInnerHTML={{
        __html: html
      }}
    />
  );
};

export default HtmlView;
