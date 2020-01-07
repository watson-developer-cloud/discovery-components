import React, { useContext, useEffect, useMemo, useState } from 'react';
import get from 'lodash/get';
import { SkeletonText } from 'carbon-components-react';
import { SearchApi, SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { TablesOnlyToggle } from './components/TablesOnlyToggle/TablesOnlyToggle';
import { Result } from './components/Result/Result';
import { SpellingSuggestion } from './components/SpellingSuggestion/SpellingSuggestion';
import { findCollectionName, getDisplaySettings, findTablesWithoutResults } from './utils';
import { useDeepCompareEffect } from 'utils/useDeepCompareMemoize';
import {
  baseClass,
  searchResultClass,
  searchResultLoadingClass,
  searchResultsHeaderClass,
  searchResultsListClass
} from './cssClasses';
import { defaultMessages, Messages } from './messages';
import { withErrorBoundary } from 'react-error-boundary';
import { FallbackComponent } from 'utils/FallbackComponent';
import onErrorCallback from '../../utils/onErrorCallback';

const DEFAULT_LOADING_COUNT = 3;

export interface SearchResultsProps {
  /**
   * specify a field on the result object to pull the result title from
   * if this field does not contain a valid title, document_id will be used.
   */
  resultTitleField?: string;
  /**
   * specify a field on the result object to create the result link.
   * When clicking the "View passage in document" button, the user will be taken to the corresponding link rather than attempting to
   * preview the text using the CIDocument component.
   */
  resultLinkField?: string;
  /**
   * specify a string template using mustache templating syntax https://github.com/janl/mustache.js to create the result link.
   * When clicking the "View passage in document" button, the user will be taken to the corresponding link rather than attempting to
   * preview the text using the CIDocument component.
   */
  resultLinkTemplate?: string;
  /**
   * specify a field on the result object that will be displayed if there is no passage or usePassages is set to false
   */
  bodyField?: string;
  /**
   * specify whether or not any html in passages should be cleaned of html element tags
   */
  dangerouslyRenderHtml?: boolean;
  /**
   * specify whether or not passages should be displayed in the search results
   */
  usePassages?: boolean;
  /**
   * specify an approximate max length for passages returned to the Result component
   * default length is 400. Min length is 50 and max length is 2000.
   */
  passageLength?: number;
  /**
   * specify a className for styling passage text and highlights
   */
  passageTextClassName?: string;
  /**
   * specify whether only table results should be displayed by default
   */
  showTablesOnly?: boolean;
  /**
   * specify whether to display a toggle for showing table search results only
   */
  showTablesOnlyToggle?: boolean;
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages?: Partial<Messages>;
}

const SearchResults: React.FunctionComponent<SearchResultsProps> = ({
  resultLinkField,
  resultLinkTemplate,
  resultTitleField,
  bodyField,
  dangerouslyRenderHtml = false,
  usePassages,
  passageLength,
  passageTextClassName,
  showTablesOnlyToggle,
  showTablesOnly = false,
  messages = defaultMessages
}) => {
  const mergedMessages = { ...defaultMessages, ...messages };

  const {
    searchResponseStore: { data: searchResponse, isLoading, parameters },
    collectionsResults,
    componentSettings
  } = useContext(SearchContext);
  const [showTablesOnlyResults, setShowTablesOnlyResults] = useState(showTablesOnly);
  const [hasFetchedDocuments, setHasFetchedDocuments] = useState(false);

  const displaySettings = getDisplaySettings(
    { resultTitleField, bodyField, usePassages },
    componentSettings
  );

  const { setSearchParameters, fetchDocuments } = useContext(SearchApi);
  const matchingResults = (searchResponse && searchResponse.matching_results) || 0;
  const results = (searchResponse && searchResponse.results) || [];
  const tableResults = (searchResponse && searchResponse.table_results) || [];
  const emptySearch = searchResponse ? mergedMessages.noResultsFoundText : '';
  const hasTables = tableResults && tableResults.length > 0;
  const hasMatchingResults = matchingResults && matchingResults > 0;
  const resultsFound = showTablesOnlyResults ? hasTables : hasMatchingResults;
  const [showTablesOnlyToggleState, setShowTablesOnlyToggleState] = useState(
    typeof showTablesOnlyToggle === 'undefined' ? hasTables : showTablesOnlyToggle
  );

  useEffect(() => {
    if (passageLength) {
      setSearchParameters((currentSearchParameters: DiscoveryV2.QueryParams) => {
        return {
          ...currentSearchParameters,
          passages: {
            characters: passageLength,
            enabled: true
          }
        };
      });
    }
  }, [passageLength, setSearchParameters]);

  useEffect(() => {
    setShowTablesOnlyResults(showTablesOnly);
  }, [showTablesOnly]);

  useEffect(() => {
    setHasFetchedDocuments(false);
  }, [parameters.naturalLanguageQuery]);

  useEffect(() => {
    setShowTablesOnlyToggleState(
      typeof showTablesOnlyToggle === 'undefined' ? hasTables : showTablesOnlyToggle
    );
  }, [showTablesOnlyToggle, hasTables]);

  // tablesWithoutResults are the tables in our searchResponse with no corresponding QueryResult
  useDeepCompareEffect(() => {
    const tableResults = (searchResponse && searchResponse.table_results) || [];
    const results = (searchResponse && searchResponse.results) || [];
    const tablesWithoutResults = findTablesWithoutResults(tableResults, results);
    if (!hasFetchedDocuments && tablesWithoutResults && tablesWithoutResults.length) {
      const filterString =
        'document_id::' + tablesWithoutResults.map(table => table.source_document_id).join('|');
      fetchDocuments(filterString, searchResponse);
      setHasFetchedDocuments(true);
    }
  }, [searchResponse, fetchDocuments, hasFetchedDocuments]);

  const skeletons = useMemo(() => {
    const searchResultLoadingClasses = [searchResultClass, searchResultLoadingClass];
    const numberOfSkeletons = Math.min(parameters.count || 10, DEFAULT_LOADING_COUNT);
    const size = Array.from(Array(numberOfSkeletons).keys());
    return size.map(number => {
      return (
        <div
          data-testid="skeleton_text"
          key={number.toString()}
          className={searchResultLoadingClasses.join(' ')}
        >
          <SkeletonText paragraph width={'85%'} />
        </div>
      );
    });
  }, [parameters.count]);

  return (
    <div className={baseClass}>
      <div className={searchResultsHeaderClass} data-testid="search_results_header">
        <SpellingSuggestion spellingSuggestionPrefix={mergedMessages.spellingSuggestionsPrefix} />
        <TablesOnlyToggle
          setShowTablesOnlyResults={setShowTablesOnlyResults}
          showTablesOnlyToggle={showTablesOnlyToggleState}
          showTablesOnlyResults={showTablesOnlyResults}
          messages={mergedMessages}
        />
      </div>
      {isLoading ? (
        skeletons
      ) : resultsFound ? (
        <div className={searchResultsListClass}>
          {showTablesOnlyResults
            ? (tableResults as DiscoveryV2.QueryTableResult[]).map(table => {
                const collectionName = findCollectionName(collectionsResults, table);
                const result = results.find(
                  result => result.document_id === table.source_document_id
                );

                return (
                  <Result
                    key={`${table.collection_id}_${table.table_id}`}
                    bodyField={displaySettings.bodyField}
                    collectionName={collectionName}
                    result={result}
                    resultLinkField={resultLinkField}
                    resultLinkTemplate={resultLinkTemplate}
                    resultTitleField={displaySettings.resultTitleField}
                    showTablesOnlyResults={showTablesOnlyResults}
                    table={table}
                    messages={mergedMessages}
                  />
                );
              })
            : (results as DiscoveryV2.QueryResult[]).map(result => {
                const documentTableResult:
                  | DiscoveryV2.QueryTableResult
                  | undefined = tableResults.find(tableResult => {
                  return tableResult.source_document_id === result.document_id;
                });
                const collectionName = findCollectionName(collectionsResults, result);
                return (
                  <Result
                    key={`${get(result, 'result_metadata.collection_id')}_${result.document_id}`}
                    bodyField={displaySettings.bodyField}
                    collectionName={collectionName}
                    passageTextClassName={passageTextClassName}
                    result={result}
                    resultLinkField={resultLinkField}
                    resultLinkTemplate={resultLinkTemplate}
                    resultTitleField={displaySettings.resultTitleField}
                    table={documentTableResult}
                    usePassages={displaySettings.usePassages}
                    dangerouslyRenderHtml={dangerouslyRenderHtml}
                    messages={mergedMessages}
                  />
                );
              })}
        </div>
      ) : (
        emptySearch && <div className={searchResultClass}>{emptySearch}</div>
      )}
    </div>
  );
};

export default withErrorBoundary(
  SearchResults,
  FallbackComponent('SearchResults'),
  onErrorCallback
);
