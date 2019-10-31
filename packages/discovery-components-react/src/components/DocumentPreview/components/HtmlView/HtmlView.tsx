import React, { FC } from 'react';
import { QueryResult } from '@disco-widgets/ibm-watson/discovery/v2';
import DOMPurify from 'dompurify';
import get from 'lodash/get';

interface Props {
  /**
   * Document data returned by query
   */
  document: QueryResult;
}

export const HtmlView: FC<Props> = ({ document }) => {
  const html = document ? DOMPurify.sanitize(get(document, 'html')) : '';

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default HtmlView;
