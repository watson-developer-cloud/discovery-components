import React, {
  ComponentType,
  useContext,
  useEffect,
  useRef,
  forwardRef,
  HTMLAttributes
} from 'react';
import { encodeHTML } from 'entities';
import { settings } from 'carbon-components';
import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import { clearNodeChildren } from 'utils/dom';
import { findOffsetInDOM, createFieldRects } from 'utils/document/documentUtils';
import { isPassage } from '../Highlight/typeUtils';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import { isJsonFile, isCsvFile } from '../../utils/documentData';
import ErrorView from './ErrorView';

interface Props extends HTMLAttributes<HTMLElement> {
  /**
   * Document data returned by query
   */
  document: QueryResult;
  highlight?: QueryResultPassage | QueryTableResult;
  /**
   * Check to disable toolbar in parent
   */
  setLoading: (loading: boolean) => void;
  /**
   * Callback which is invoked with whether to enable/disable toolbar controls
   */
  setHideToolbarControls?: (disabled: boolean) => void;
  /**
   * React component rendered as a fallback when no preview is available.
   * When specified, the default error component which displays `cannotPreviewMessage`
   * won't be displayed.
   */
  fallbackComponent?: ComponentType<ErrorComponentProps>;
  /**
   * Error title displayed when no preview can be displayed by this component.
   * Unused when `fallbackComponent` is provided
   */
  cannotPreviewMessage?: string;
  /**
   * Error message displayed when no preview can be displayed by this component.
   * Unused when `fallbackComponent` is provided
   */
  cannotPreviewMessage2?: string;
  loading: boolean;
  hideToolbarControls: boolean;
}

interface ErrorComponentProps {
  document: QueryResult;
}

export const SimpleDocument = forwardRef<any, Props>(
  (
    {
      document,
      highlight,
      loading,
      setLoading,
      hideToolbarControls,
      setHideToolbarControls,
      fallbackComponent: FallbackComponent,
      cannotPreviewMessage = "Can't preview document",
      cannotPreviewMessage2 = "Try the JSON tab for a different view of this document's data.",
      ...rest
    },
    scrollRef
  ) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const { componentSettings } = useContext(SearchContext);

    let html,
      passage: QueryResultPassage | null = null;
    if (document) {
      // JSON and CSV files will default to displaying the specified body field, `text` field, or passage highlighting field.
      // Otherwise an error is shown
      const isJsonOrCsvType = isJsonFile(document) || isCsvFile(document);
      let field: string | undefined = componentSettings?.fields_shown?.body?.field ?? 'text';
      if (
        isJsonOrCsvType &&
        (!highlight || !isPassage(highlight)) &&
        document[field] === undefined
      ) {
        // An error message will be rendered
        html = null;
      } else {
        // if there is a passage highlight, use text values from field specified in passage
        if (highlight && isPassage(highlight)) {
          passage = highlight;
          field = passage.field;
          if (!field) {
            // if passage has no defined field, choose a default and unset `highlight`
            field = 'text';
            highlight = undefined;
          }
        } else {
          // see if user has specified a body field; default to 'text' field
          field = componentSettings?.fields_shown?.body?.field || 'text';
        }

        let text;
        if (typeof document[field] === 'undefined') {
          // such a field doesn't exist in the document; fall back to 'text'
          text = document.text || '';
          passage = null;
        } else {
          text = document[field];
        }

        if (!Array.isArray(text)) {
          text = [text];
        }
        let rollingStart = 0;
        html = text
          .map((val: string) => {
            const end = rollingStart + val.length - 1;
            const res = `<p data-child-begin=${rollingStart} data-child-end=${end}>${encodeHTML(
              val
            )}</p>`;
            rollingStart = end + 1;
            return res;
          })
          .join('\n');
      }
    }

    useEffect(() => {
      if (document) {
        if (loading) {
          setLoading(false);
        }
        if (typeof setHideToolbarControls === 'function' && !hideToolbarControls) {
          setHideToolbarControls(true);
        }
      }
    }, [document, hideToolbarControls, loading, setHideToolbarControls, setLoading]);

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

      try {
        const offsets = findOffsetInDOM(contentNode, begin, end);

        const fragment = window.document.createDocumentFragment();
        const parentRect = contentNode.getBoundingClientRect() as DOMRect;
        createFieldRects({
          fragment,
          parentRect,
          fieldType: 'passage',
          fieldValue: '',
          fieldId: begin.toString(),
          ...offsets
        });
        highlightNode.appendChild(fragment);

        // scroll highlight into view
        const firstFieldRect = highlightNode.querySelector('.field--rect');
        if (firstFieldRect) {
          firstFieldRect.scrollIntoView({ block: 'center' });
        }
      } catch (err) {
        console.error('Error creating field rects', err);
      }
    }, [passage]);

    const baseClass = `${settings.prefix}--simple-document`;
    return (
      <div ref={scrollRef} className={baseClass} {...rest}>
        {html ? (
          <div className={`${baseClass}__wrapper`}>
            <div ref={highlightRef} />
            <div
              className={`${baseClass}__content`}
              dangerouslySetInnerHTML={{ __html: html }}
              ref={contentRef}
            />
          </div>
        ) : FallbackComponent ? (
          <FallbackComponent document={document} />
        ) : (
          <ErrorView header={cannotPreviewMessage} message={cannotPreviewMessage2} />
        )}
      </div>
    );
  }
);

export default SimpleDocument;
