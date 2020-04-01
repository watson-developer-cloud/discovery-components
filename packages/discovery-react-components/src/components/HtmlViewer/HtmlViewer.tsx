/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
  FC,
  useEffect,
  useReducer,
  useState,
  Reducer,
  SetStateAction,
  Dispatch
} from 'react';
import { settings } from 'carbon-components';
import { QueryResult } from 'ibm-watson/discovery/v2';
import HtmlViewerDisplay from './components/HtmlViewerDisplay/HtmlViewerDisplay';
import NavigationToolbar from './components/NavigationToolbar/NavigationToolbar';
import { processDoc } from './utils/processDoc';
import { getId, findElement } from 'utils/document/idUtils';
import { withErrorBoundary, WithErrorBoundaryProps } from 'utils/hoc/withErrorBoundary';
import { Field } from 'components/CIDocument/types';
import { defaultTheme, Theme } from 'utils/theme';
import { DocumentData, Section, EnrichmentField } from './types';
import {
  defaultMessages as HtmlViewerDefaultMsgs,
  Messages as HtmlViewerMessages
} from './messages';

export type Messages = HtmlViewerMessages;

const defaultMessages = {
  ...HtmlViewerDefaultMsgs
};

export type ItemChangeFn = (item: string[]) => void;
const noop = (): void => {};

interface State {
  isError: boolean;
  styles: string[];
  sections: Section[];
  itemMap: {
    byItem: any;
    bySection: any;
  };
}

enum ActionType {
  RESET = 'RESET',
  SET = 'SET',
  ERROR = 'ERROR'
}

interface Action {
  type: ActionType;
  data: any;
}

const INITIAL_STATE: State = {
  isError: false,
  styles: [],
  sections: [],
  itemMap: { byItem: {}, bySection: {} }
};

const base = `${settings.prefix}--html-viewer`;

export interface HtmlViewerProps extends WithErrorBoundaryProps {
  /**
   * Document data, as that returned by a query. Overrides result from SearchContext
   */
  document: QueryResult;
  /**
   * Specify which field in the document holds the text data to display
   */
  dataField?: string;
  /**
   * List of ids of elements to highight
   */
  // TODO: colbyj restrict this to string array (ids)?
  highlightedList: any[];
  /**
   * Callback function on document processing success
   */
  enrichmentFields?: EnrichmentField[];
  /**
   * List of enrichment fields to process within this document
   */
  onProcessingSuccess?: (data: DocumentData) => void;
  /**
   * Callback function on document processing failure
   */
  onProcessingFailure?: (error: Error) => void;
  /**
   * Callback function on active item change
   */
  onActiveItemChange?: ItemChangeFn;
  /**
   * i18n messages for the component
   */
  messages?: Messages;
  /**
   * Color theme, for select areas which cannot be specified in CSS
   */
  theme?: Theme;
  /**
   * Override autosizing of document content with specified width. Useful for testing.
   */
  overrideDocWidth?: number;
  /**
   * Override autosizing of document content with specified height. Useful for testing.
   */
  overrideDocHeight?: number;
}

const HtmlViewer: FC<HtmlViewerProps> = ({
  document,
  dataField,
  highlightedList,
  enrichmentFields = [],
  onProcessingSuccess = noop,
  onProcessingFailure = noop,
  onActiveItemChange = noop,
  messages = defaultMessages,
  theme = defaultTheme,
  overrideDocWidth,
  overrideDocHeight,
  didCatch
}) => {
  const [state, dispatch] = useReducer<Reducer<State, Action>>(docStateReducer, INITIAL_STATE);

  const resetStates = (): void => {
    setActiveItem([]);
    setSubparts([]);
    setActiveSubpart([]);
  };

  useEffect(() => {
    let didCancel = false;

    async function process(): Promise<void> {
      if (!didCancel) {
        try {
          const doc = await processDoc(document, {
            sections: true,
            itemMap: true,
            enrichmentFields,
            ...(dataField ? { field: dataField } : {})
          });
          const data: DocumentData = {
            styles: doc.styles,
            sections: doc.sections,
            itemMap: doc.itemMap
          };
          dispatch({
            type: ActionType.SET,
            data
          });
          onProcessingSuccess(doc);
        } catch (err) {
          dispatch({ type: ActionType.ERROR, data: err });
          onProcessingFailure(err);
        }
      }
    }

    resetStates();
    process();

    return (): void => {
      didCancel = true;
    };
  }, [dataField, didCatch, document, enrichmentFields, onProcessingFailure, onProcessingSuccess]);
  // }, [dataField, didCatch, document, enrichmentFields, onProcessingFailure, onProcessingSuccess]);

  const [activeItem, setActiveItem] = useState<string[]>([]);
  useEffect(() => {
    if (highlightedList.length === 0) {
      setActiveItem([]);
      setSubparts([]);
    } else if (!findElement(highlightedList, activeItem)) {
      setActiveItem([getId(highlightedList[0])]);
    }
    // This should only run when the list updates,
    // to set the active id to the first item in the list, as necessary
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedList]);

  const [subparts, setSubparts] = useState<string[]>([]);
  useEffect(() => {
    setSubparts([]);
  }, [activeItem]);

  const [activeSubpart, setActiveSubpart] = useState<string[]>([]);
  useEffect(() => {
    setActiveItem([]);
    setSubparts([]);
  }, [activeSubpart]);

  return (
    <div className={base}>
      <div className={`${base}__main`}>
        <article className={`${base}__doc`} aria-label={messages.defaultDocumentName}>
          {state.isError || didCatch ? (
            <p className={`${base}__docError`}>{messages.parseErrorMessage}</p>
          ) : (
            <HtmlViewerDisplay
              styles={state.styles}
              sections={state.sections}
              itemMap={state.itemMap}
              highlightedList={highlightedList}
              activeItem={activeItem}
              subparts={subparts}
              activeSubpart={activeSubpart}
              onItemClick={onItemClick({ setActiveItem, onActiveItemChange })}
              theme={theme}
              width={overrideDocWidth}
              height={overrideDocHeight}
            />
          )}
        </article>
      </div>
    </div>
  );
};

function docStateReducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.RESET: {
      return { ...state, ...INITIAL_STATE };
    }
    case ActionType.SET: {
      return { ...state, isError: false, ...action.data };
    }
    case ActionType.ERROR: {
      return { ...state, isError: true };
    }
    default: {
      throw new Error(`Doc state reducer called with invalid action type: ${action.type}`);
    }
  }
}

function onItemClick({
  setActiveItem,
  onActiveItemChange
}: {
  setActiveItem: Dispatch<SetStateAction<string[]>>;
  onActiveItemChange: ItemChangeFn;
}) {
  return function(clickedItem: Field): void {
    if (clickedItem && clickedItem.id) {
      const item = [clickedItem.id];
      setActiveItem(item);
      onActiveItemChange(item);
    }
  };
}

const ErrorBoundHtmlViewer: any = withErrorBoundary(HtmlViewer);
ErrorBoundHtmlViewer.HtmlViewerDisplay = HtmlViewerDisplay;
ErrorBoundHtmlViewer.NavigationToolbar = NavigationToolbar;

export default ErrorBoundHtmlViewer;
export { ErrorBoundHtmlViewer as HtmlViewer };
