import React, { FC } from 'react';
import { settings } from 'carbon-components';
import { QueryResult } from '@disco-widgets/ibm-watson/discovery/v1';

interface Props {
  /**
   * Document data returned by query
   */
  document: QueryResult;
}

export const SimpleDocument: FC<Props> = ({ document }) => {
  const base = `${settings.prefix}--simple-document`;
  const { text, document_passages: passages } = document;

  let html = `<p>${text}</p>`;
  if (passages && passages.length > 0) {
    // use text from field defined in passage
    // (only support first passage)
    const { field } = passages[0];
    if (field && field !== 'text') {
      html = document[field].map((val: string) => `<p>${val}</p>`).join('\n');
    }
  }

  return (
    <div className={`${base}`}>
      <div className={`${base}__content`} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default SimpleDocument;
