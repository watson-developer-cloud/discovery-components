import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  forwardRef,
  HTMLAttributes
} from 'react';
import { settings } from 'carbon-components';
import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import DOMPurify from 'dompurify';
import get from 'lodash/get';
import flatMap from 'lodash/flatMap';
import { processDoc, ProcessedDoc, ProcessedBbox, Location } from 'utils/document/processDoc';
import { findMatchingBbox } from 'components/DocumentPreview/utils/box';
import { findOffsetInDOM, createFieldRects } from 'utils/document/documentUtils';
import { clearNodeChildren } from 'utils/dom';
import { getTextMappings } from 'components/DocumentPreview/utils/documentData';
import { getPassagePageInfo } from '../Highlight/passages';
import { isPassage } from '../Highlight/typeUtils';
import { QueryResultWithOptionalMetadata } from 'components/DocumentPreview/types';

interface Props extends HTMLAttributes<HTMLElement> {
  /**
   * Document data returned by query
   */
  document: QueryResultWithOptionalMetadata;
  /**
   * table to highlight in document. Reference to item with `document.table_results`
   */
  highlight?: QueryTableResult | QueryResultPassage;
  /**
   * Check to disable toolbar in parent
   */
  setLoading?: (loading: boolean) => void;
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
  FORBID_TAGS: ['input', 'form', 'a', 'button', 'script', 'style'],
  FORBID_CONTENTS: ['script', 'style'],
  KEEP_CONTENT: true,
  WHOLE_DOCUMENT: true
};

const baseClassName = `${settings.prefix}--html`;

export const HtmlView = forwardRef<any, Props>(
  ({ document, highlight, setHideToolbarControls, setLoading, ...rest }, scrollRef) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (setHideToolbarControls) {
        setHideToolbarControls(true);
      }
    }, [setHideToolbarControls]);

    const [html, setHtml] = useState<string | null>(null);
    const [processedDoc, setProcessedDoc] = useState<ProcessedDoc | null>(null);
    const [highlightLocations, setHighlightLocations] = useState<Location[]>([]);

    useLayoutEffect(() => {
      DOMPurify.addHook('afterSanitizeAttributes', function (node) {
        if (node.tagName === 'TABLE') {
          node.setAttribute('role', 'presentation');
        }
      });

      return () => {
        DOMPurify.removeHook('afterSanitizeAttributes');
      };
    }, []);

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

            const fullHtml = processedDoc.sections
              ? processedDoc.sections.map(section => section.html).join('')
              : '';

            setProcessedDoc(processedDoc);

            // TODO: restore the styles getting added back into html as part of issue #12210, once sandboxed
            // set sanitized HTML (removing scripts, etc)
            // setHtml(`
            //   <style>${processedDoc.styles}</style>
            //   ${DOMPurify.sanitize(fullHtml, SANITIZE_CONFIG)}
            // `);
            setHtml(DOMPurify.sanitize(fullHtml, SANITIZE_CONFIG));
            if (!!setLoading) {
              setLoading(false);
            }
          };
          process();
        } else {
          // if no highlight, then no need to "process"
          setHtml(docHtml ? DOMPurify.sanitize(docHtml, SANITIZE_CONFIG) : '');
          if (!!setLoading) {
            setLoading(false);
          }
        }
      }
    }, [document, highlight, setLoading]);

    useEffect(() => {
      if (highlight) {
        const textMappings = getTextMappings(document);
        if (isPassage(highlight) && textMappings) {
          const textMappingBbox = getPassagePageInfo(textMappings, highlight);
          if (processedDoc && processedDoc.bboxes && textMappingBbox) {
            const passageLocs: Location[] = flatMap(textMappingBbox, bbox => {
              return findMatchingBbox(bbox, processedDoc.bboxes as ProcessedBbox[]);
            }).map(bbox => {
              return bbox.location;
            });
            setHighlightLocations(passageLocs);
          }
        } else {
          const tableLoc = get(highlight, 'table.location', {});
          setHighlightLocations([tableLoc]);
        }
      }
    }, [document, highlight, processedDoc]);

    // highlight table and scroll into view
    useEffect(() => {
      if (!html || !highlightLocations) {
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

      highlightLocations.forEach(location => {
        try {
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
            fieldValue: '',
            fieldId: begin.toString(),
            ...offsets
          });
          highlightNode.appendChild(fragment);
        } catch (err) {
          console.error('Error creating field rects', err);
        }
      });

      // scroll highlight into view
      const firstFieldRect = highlightNode.querySelector('.field--rect');
      if (firstFieldRect) {
        firstFieldRect.scrollIntoView({ block: 'center' });
      }
    }, [highlight, html, highlightLocations]);

    return (
      <div ref={scrollRef} className={baseClassName} {...rest}>
        <div ref={highlightRef} />
        {html && (
          <div
            className={`${baseClassName}__content`}
            dangerouslySetInnerHTML={{
              __html: html
            }}
            ref={contentRef}
          />
        )}
      </div>
    );
  }
);

export default HtmlView;
