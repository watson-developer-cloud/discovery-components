import React, { FC, useEffect, useRef } from 'react';
import { settings } from 'carbon-components';
import {
  QueryResult,
  QueryResultPassage,
  QueryTableResult
} from '@disco-widgets/ibm-watson/discovery/v2';
import { clearNodeChildren } from '../../utils/dom';
import { findOffsetInDOM, createFieldRects } from '../../utils/document';
import { isPassage } from '../Highlight/passages';

interface Props {
  /**
   * Document data returned by query
   */
  document: QueryResult;

  highlight?: QueryResultPassage | QueryTableResult;
}

export const SimpleDocument: FC<Props> = ({ document, highlight }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  let html,
    passage: QueryResultPassage | null = null;
  if (document) {
    const text = document.text;
    html = `<p data-child-begin="0" data-child-end=${text.length - 1}>${text}</p>`;

    // TODO handle table highlighting? (or do we? if we have html, will we have structural data, in order to do PdfFallback instead?)
    if (highlight && isPassage(highlight)) {
      passage = highlight as QueryResultPassage;
      const { field } = passage;
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

    if (!passage || !contentNode || !highlightNode) {
      return;
    }

    const { start_offset: begin, end_offset: end } = passage;
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
  }, [passage]);

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
