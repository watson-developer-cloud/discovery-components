import React, { useContext } from 'react';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import mustache from 'mustache';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import {
  SearchApi,
  SearchContext,
  SelectedResult
} from 'components/DiscoverySearch/DiscoverySearch';
import { ResultElement } from '../ResultElement/ResultElement';
import { SkeletonText } from 'carbon-components-react';
import {
  searchResultClass,
  searchResultSelectedClass,
  searchResultCurationClass,
  searchResultContentWrapperClass,
  searchResultContentWrapperHalfClass,
  searchResultFooterClass,
  searchResultFooterTitleClass,
  searchResultFooterCollectionNameClass
} from 'components/SearchResults/cssClasses';
import { getDocumentTitle } from 'utils/getDocumentTitle';
import { Messages } from 'components/SearchResults/messages';
import { formatMessage } from 'utils/formatMessage';

export interface ResultProps {
  /**
   * specify a field on the result object that will be displayed if there is no passage or usePassages is set to false
   */
  bodyField: string;
  /**
   * collection name to render on each search result
   */
  collectionName?: string;
  /**
   * specify a className for styling passage text and highlights
   */
  passageTextClassName?: string;
  /**
   * the query result document associated with the search result
   */
  result?: DiscoveryV2.QueryResult;
  /**
   * specify a field on the result object to pull the result link from
   * This will disable the "View passage in document" button and instead take the user to the corresponding link when clicked.
   */
  resultLinkField?: string;
  /**
   * specify a string template using mustache templating syntax https://github.com/janl/mustache.js to create the result link from each result object
   * This will disable the "View passage in document" button and instead take the user to the corresponding link when clicked.
   */
  resultLinkTemplate?: string;
  /**
   * specify a field on the result object to pull the result title from
   * if this field does not contain a valid title, document_id will be used
   */
  resultTitleField: string;
  /**
   * specifies whether to show tables only results or regular search results
   */
  showTablesOnlyResults?: boolean;
  /**
   * the table result element for the search result
   */
  table?: DiscoveryV2.QueryTableResult;
  /**
   * specify whether or not any html in passages should be cleaned of html element tags
   */
  dangerouslyRenderHtml?: boolean;
  /**
   * specify whether or not passages should be displayed in the search results
   */
  usePassages?: boolean;
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Partial<Messages>;
  /**
   * callback function from the component for sending document
   */
  onSelectResult?: (document: { document: DiscoveryV2.QueryResult }) => void;
}
export const Result: React.FunctionComponent<ResultProps> = ({
  bodyField,
  collectionName,
  passageTextClassName,
  result,
  resultLinkField,
  resultLinkTemplate,
  resultTitleField,
  showTablesOnlyResults,
  table,
  dangerouslyRenderHtml,
  usePassages,
  onSelectResult,
  messages
}) => {
  const { setSelectedResult } = useContext(SearchApi);
  const {
    selectedResult,
    fetchDocumentsResponseStore: { isLoading }
  } = useContext(SearchContext);

  const firstPassage: DiscoveryV2.QueryResultPassage | undefined = get(
    result,
    'document_passages[0]'
  );
  const firstPassageText = get(firstPassage, 'passage_text');
  const hasPassage = usePassages && !!firstPassageText;
  let displayedText: string | undefined = get(result, bodyField);
  if (hasPassage) {
    displayedText = firstPassageText;
  }
  const shouldDangerouslyRenderHtml = hasPassage || dangerouslyRenderHtml;
  const displayedTextElement = hasPassage ? firstPassage : null;
  const displayedTextElementType = hasPassage ? 'passage' : null;
  const tableHtml: string | undefined = get(table, 'table_html');
  // Need to check that showTablesOnlyResults isn't enabled to ensure text for a linked result isn't displayed in a tables only results view
  const hasText = displayedText && !showTablesOnlyResults;
  const emptyResultContent = !(hasText || tableHtml);

  // Don't display tables-only results when displaying passages
  if (!showTablesOnlyResults && tableHtml && !displayedText) {
    return null;
  }

  let title = getDocumentTitle(result, resultTitleField);

  if (Array.isArray(title)) {
    title = title[0]; // only first element will be shown if title is array
  }

  const searchResultClasses = [searchResultClass];
  if (isEqual(result, selectedResult.document)) {
    searchResultClasses.push(searchResultSelectedClass);
  }
  const documentRetrievalSource: string | undefined = get(
    result,
    'result_metadata.document_retrieval_source'
  );
  if (documentRetrievalSource === 'curation') {
    searchResultClasses.push(searchResultCurationClass);
  }
  const searchResultContentWrapperClasses = [searchResultContentWrapperClass];
  if (displayedText && tableHtml && !showTablesOnlyResults) {
    searchResultContentWrapperClasses.push(searchResultContentWrapperHalfClass);
  }

  const handleSelectResult = (
    element: SelectedResult['element'],
    elementType: SelectedResult['elementType']
  ) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      if (resultLinkField || resultLinkTemplate) {
        // expected behavior, use the resultLinkField if it exists over the resultLinkTemplate
        const url = resultLinkField
          ? get(result, resultLinkField)
          : mustache.render(resultLinkTemplate as string, result);
        window.open(url);
      } else if (result) {
        setSelectedResult({ document: result, element, elementType });
        //When onSelectResult props is present, send back document
        onSelectResult && onSelectResult({ document: result });
      }
    };
  };

  return (
    <div className={searchResultClasses.join(' ')}>
      <div className={searchResultContentWrapperClasses.join(' ')}>
        {emptyResultContent ? (
          <ResultElement
            body={messages.emptyResultContentBodyText!}
            handleSelectResult={handleSelectResult}
            hasResult={!!result}
          />
        ) : (
          <>
            {displayedText && !showTablesOnlyResults && (
              <ResultElement
                body={displayedText}
                buttonText={hasPassage ? messages.viewExcerptInDocumentButtonText : undefined}
                element={displayedTextElement}
                elementType={displayedTextElementType}
                handleSelectResult={handleSelectResult}
                passageTextClassName={passageTextClassName}
                hasResult={!!result}
                dangerouslyRenderHtml={shouldDangerouslyRenderHtml}
              />
            )}
            {tableHtml && (
              <ResultElement
                body={tableHtml}
                buttonText={messages.viewTableInDocumentButtonText}
                element={table}
                elementType="table"
                handleSelectResult={handleSelectResult}
                hasResult={!!result}
                dangerouslyRenderHtml={true}
                elementLabel={
                  messages.elementTableLabel
                    ? formatMessage(
                        messages.elementTableLabel,
                        { documentName: title },
                        false
                      ).join('')
                    : undefined
                }
              />
            )}
          </>
        )}
      </div>
      {(collectionName || result) && (
        <div className={searchResultFooterClass}>
          {isLoading || !result ? (
            <SkeletonText width={'30%'} data-testid="result-title-skeleton" />
          ) : (
            <div className={searchResultFooterTitleClass} title={title}>
              {title}
            </div>
          )}
          {collectionName && (
            <div className={searchResultFooterCollectionNameClass} title={collectionName}>
              {messages.collectionLabel} {collectionName}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
