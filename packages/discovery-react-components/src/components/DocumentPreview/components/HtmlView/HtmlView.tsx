import React, { FC, useEffect, useState, useRef } from 'react';
import { settings } from 'carbon-components';
import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import DOMPurify from 'dompurify';
import get from 'lodash/get';
import { processDoc, ProcessedDoc, ProcessedBbox, Location } from 'utils/document/processDoc';
import { findMatchingBbox } from 'components/DocumentPreview/utils/box';
import { findOffsetInDOM, createFieldRects } from 'utils/document/documentUtils';
import { clearNodeChildren } from 'utils/dom';
import { usePassage, isPassage } from '../Highlight/passages';

interface Props {
  /**
   * Document data returned by query
   */
  document: QueryResult;
  /**
   * table to highlight in document. Reference to item with `document.table_results`
   */
  highlight?: QueryTableResult | QueryResultPassage;
  /**
   * Check to disable toolbar in parent
   */
  setLoading: (loading: boolean) => void;
  /**
   * Callback which is invoked with whether to enable/disable toolbar controls
   */
  setHideToolbarControls?: (disabled: boolean) => void;
}

export const canRenderHtmlView = (document?: QueryResult): boolean => !!get(document, 'html');

const SANITIZE_CONFIG = {
  ADD_TAGS: ['bbox'],
  ADD_ATTR: [
    // bbox
    'page'
  ],
  WHOLE_DOCUMENT: true
};

const base = `${settings.prefix}--html`;

export const HtmlView: FC<Props> = ({
  document,
  highlight,
  setHideToolbarControls,
  setLoading
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  if (setHideToolbarControls) {
    setHideToolbarControls(true);
  }

  const [html, setHtml] = useState<string | null>(null);
  const [processedDoc, setProcessedDoc] = useState<ProcessedDoc | null>(null);
  const [locationArray, setLocationArray] = useState<Array<Location> | null>(null);

  const textMappingBbox = usePassage(document, highlight as QueryResultPassage);
  useEffect(() => {
    if (highlight) {
      if (isPassage(highlight)) {
        if (processedDoc && textMappingBbox) {
          let processedDocBbox: ProcessedBbox[] = [];
          textMappingBbox &&
            processedDoc.bboxes &&
            textMappingBbox.forEach(Bbox => {
              const tempBboxs = findMatchingBbox(Bbox, processedDoc.bboxes as ProcessedBbox[]);
              processedDocBbox = processedDocBbox.concat(tempBboxs);
            });
          let passageLocs: Array<Location> = [];
          processedDocBbox &&
            processedDocBbox.forEach(Bbox => {
              passageLocs.push(Bbox.location);
            });
          setLocationArray(passageLocs);
        }
      } else {
        const tableLoc = get(highlight, 'table.location', {});
        setLocationArray([tableLoc]);
      }
    }
  }, [document, highlight, processedDoc, textMappingBbox]);

  useEffect(() => {
    if (document) {
      const docHtml = document.html;
      if (docHtml && highlight) {
        // "process" the original HTML string in order to find offsets for DOM nodes
        const process = async (): Promise<void> => {
          const processedDoc = await processDoc(
            { ...document, docHtml },
            { sections: true, bbox: true }
          );
          setProcessedDoc(processedDoc);
          const fullHtml = processedDoc.sections
            ? processedDoc.sections.map(section => section.html).join('')
            : '';

          // set sanitized HTML (removing scripts, etc)
          setHtml(`
          <div>
            <style>${processedDoc.styles}</style>
            ${DOMPurify.sanitize(fullHtml, SANITIZE_CONFIG)}
          </div>`);
          setLoading(false);
        };
        process();
      } else {
        // if no highlight, then no need to "process"
        setHtml(docHtml ? DOMPurify.sanitize(docHtml, SANITIZE_CONFIG) : '');
        setLoading(false);
      }
    }
  }, [document, highlight, setLoading]);

  // highlight table and scroll into view
  useEffect(() => {
    if (!html || !locationArray) {
      return;
    }

    const contentNode = contentRef.current;
    const highlightNode = highlightRef.current;

    if (highlightNode) {
      clearNodeChildren(highlightNode);
    }

    if (!highlight || !contentNode || !highlightNode) {
      return;
    }

    locationArray.forEach(location => {
      const { begin, end } = location;
      if (typeof begin === 'undefined' || typeof end === 'undefined') {
        return;
      }

      const offsets = findOffsetInDOM(contentNode, begin, end);

      const fragment = window.document.createDocumentFragment();
      const parentRect = contentNode.getBoundingClientRect() as DOMRect;
      createFieldRects({
        fragment,
        parentRect,
        fieldType: 'highlight',
        fieldId: begin.toString(),
        ...offsets
      });
      highlightNode.appendChild(fragment);
    });

    // scroll highlight into view
    const firstFieldRect = highlightNode.querySelector('.field--rect');
    if (firstFieldRect) {
      firstFieldRect.scrollIntoView({ block: 'center' });
    }
  }, [highlight, html, locationArray]);

  return (
    <div className={base}>
      <div ref={highlightRef} />
      {html && (
        <div
          dangerouslySetInnerHTML={{
            __html: html
          }}
          ref={contentRef}
        />
      )}
    </div>
  );
};

export default HtmlView;
