import React, { FC } from 'react';
import { QueryResult } from '@disco-widgets/ibm-watson/discovery/v2';
import DOMPurify from 'dompurify';
import get from 'lodash/get';

interface Props {
  /**
   * Document data returned by query
   */
  document: QueryResult;
  /**
   * Callback to disable toolbar in parent
   */
  disableToolbar?: (disabled: boolean) => void;
}

export const HtmlView: FC<Props> = ({ document, disableToolbar }) => {
  const html = document ? DOMPurify.sanitize(get(document, 'html')) : '';
  if (disableToolbar) {
    disableToolbar(true);
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default HtmlView;
