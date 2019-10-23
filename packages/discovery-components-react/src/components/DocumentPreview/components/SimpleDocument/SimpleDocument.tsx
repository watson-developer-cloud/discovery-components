import React, { FC, useEffect, useRef } from 'react';
import { settings } from 'carbon-components';
import { QueryResult, QueryResultPassage } from '@disco-widgets/ibm-watson/discovery/v1';
import { clearNodeChildren } from '../../utils/dom';
import { findOffsetInDOM, createFieldRects } from '../../utils/document';

interface Props {
  /**
   * Document data returned by query
   */
  document: QueryResult;
}

export const SimpleDocument: FC<Props> = ({ document }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  let html, text, passages: QueryResultPassage[] | undefined;
  if (document) {
    ({ text, document_passages: passages } = document);
    html = `<p data-child-begin="0" data-child-end=${text.length - 1}>${text}</p>`;

    if (passages && passages.length > 0) {
      // use text from field defined in passage
      // (only support first passage)
      const { field } = passages[0];
      if (field && field !== 'text') {
        let rollingStart = 0;
        html = document[field]
          .map((val: string) => {
            const end = rollingStart + val.length - 1;
            const res = `<p data-child-begin=${rollingStart} data-child-end=${end}>${val}</p>`;
            rollingStart = end + 1;
            return res;
          })
          .join('\n');
      }
    }
  }

  // highlight passage and scroll into view
  useEffect(() => {
    const contentNode = contentRef.current;
    const highlightNode = highlightRef.current;

    if (highlightNode) {
      clearNodeChildren(highlightNode);
    }

    if (!passages || passages.length === 0 || !contentNode || !highlightNode) {
      return;
    }

    const { start_offset: begin, end_offset: end } = passages[0];
    if (typeof begin === 'undefined' || typeof end === 'undefined') {
      return;
    }

    const offsets = findOffsetInDOM(contentNode, begin, end);

    const fragment = window.document.createDocumentFragment();
    const parentRect = contentNode.getBoundingClientRect() as DOMRect;
    createFieldRects({
      fragment,
      parentRect,
      fieldType: 'passage',
      fieldId: begin.toString(),
      ...offsets
    });
    highlightNode.appendChild(fragment);

    // scroll highlight into view
    const firstFieldRect = highlightNode.querySelector('.field--rect');
    if (firstFieldRect) {
      firstFieldRect.scrollIntoView({ block: 'center' });
    }
  }, [passages]);

  const base = `${settings.prefix}--simple-document`;
  return html ? (
    <div className={`${base}`}>
      <div className={`${base}__wrapper`}>
        <div ref={highlightRef} />
        <div
          className={`${base}__content`}
          dangerouslySetInnerHTML={{ __html: html }}
          ref={contentRef}
        />
      </div>
    </div>
  ) : null;
};

export default SimpleDocument;
