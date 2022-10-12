import React, { useContext, useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import compact from 'lodash/compact';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import { SkeletonText } from 'carbon-components-react';
import { ReactComponent as EmptyStateIcon } from './icons/EmptyStateMagnifyingGlass.svg';
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
  searchResultsTitleClass,
  searchResultsTitleTextClass,
  searchResultsTitleQueryClass,
  searchResultsListClass,
  searchResultsEmptyListClass,
  searchResultsEmptyTitleClass,
  searchResultsEmptyTextClass
} from './cssClasses';
import { defaultMessages, Messages } from './messages';
import { withErrorBoundary } from 'react-error-boundary';
import { FallbackComponent } from 'utils/FallbackComponent';
import onErrorCallback from '../../utils/onErrorCallback';
import { DisplaySettingsParams } from './utils/getDisplaySettings';

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
  /**
   * callback function from the component for sending document
   */
  onSelectResult?: (document: { document: DiscoveryV2.QueryResult }) => void | undefined;
  /**
   * custom handler invoked when any input element changes in the SearchResults component
   */
  onChange?: (searchValue: string) => void;
  /**
   * custom handler invoked when the tablesonly toggle is changed
   */
  onTablesOnlyToggle?: (value: boolean) => void;
}

// Minimal set of document fields we need to render this component. Will be combined
// with "variable" fields set by user: bodyField, resultTitleField, resultLinkField
const BASE_QUERY_RETURN_FIELDS = [
  'document_id',
  'document_passages',
  'extracted_metadata.filename',
  'extracted_metadata.title',
  'highlight',
  'result_metadata'
];

/**
 * Display search results as a column of tiles
 *
 * NOTE: This component will update the default search parameters in the current
 * DiscoverySearch context (specifically the `return` param). This will make the
 * response data smaller by only requesting the document fields which are necessary
 * to render this component. If you need other document fields, you can do so by
 * calling `setSearchParameters`.
 */
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
  messages = defaultMessages,
  onSelectResult,
  onChange,
  onTablesOnlyToggle
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
  const hasTables = tableResults && tableResults.length > 0;
  const hasMatchingResults = matchingResults && matchingResults > 0;
  const resultsFound = showTablesOnlyResults ? hasTables : hasMatchingResults;
  const [showTablesOnlyToggleState, setShowTablesOnlyToggleState] = useState(
    typeof showTablesOnlyToggle === 'undefined' ? hasTables : showTablesOnlyToggle
  );

  useUpdateQueryReturnParam({ displaySettings, resultLinkField });

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
    if (onTablesOnlyToggle) {
      onTablesOnlyToggle(showTablesOnlyResults);
    }
  }, [showTablesOnlyResults, onTablesOnlyToggle]);

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
    if (
      !hasFetchedDocuments &&
      showTablesOnlyResults &&
      tablesWithoutResults &&
      tablesWithoutResults.length
    ) {
      const filterString =
        'document_id::' +
        uniq(tablesWithoutResults.map(table => table.source_document_id)).join('|');
      const collections = uniq(compact(tablesWithoutResults.map(table => table.collection_id)));
      fetchDocuments(filterString, collections, searchResponse || undefined);
      setHasFetchedDocuments(true);
    }
  }, [searchResponse, fetchDocuments, hasFetchedDocuments, showTablesOnlyResults]);

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
        <div className={searchResultsTitleClass}>
          <div className={searchResultsTitleTextClass}>
            {mergedMessages.searchResultsTitle}
            <span className={searchResultsTitleQueryClass}>{parameters.naturalLanguageQuery}</span>
          </div>
          <SpellingSuggestion
            spellingSuggestionPrefix={mergedMessages.spellingSuggestionsPrefix}
            onChange={onChange}
          />
        </div>
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
                    onSelectResult={onSelectResult}
                  />
                );
              })
            : (results as DiscoveryV2.QueryResult[]).map(result => {
                const documentTableResult: DiscoveryV2.QueryTableResult | undefined =
                  tableResults.find(tableResult => {
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
                    onSelectResult={onSelectResult}
                  />
                );
              })}
        </div>
      ) : (
        searchResponse && (
          <div className={cx(searchResultClass, searchResultsEmptyListClass)}>
            <EmptyStateIcon />
            <div className={searchResultsEmptyTitleClass}>{mergedMessages.noResultsFoundTitle}</div>
            <div className={searchResultsEmptyTextClass}>{mergedMessages.noResultsFoundText}</div>
          </div>
        )
      )}
    </div>
  );
};

/**
 * Hook to update search parameters' `return` param with the fields
 * that are necessary to render this component.
 */
export function useUpdateQueryReturnParam({
  displaySettings,
  resultLinkField
}: {
  displaySettings: DisplaySettingsParams;
  resultLinkField?: string;
}) {
  const {
    searchResponseStore: { parameters }
  } = useContext(SearchContext);
  const { setSearchParameters } = useContext(SearchApi);

  useDeepCompareEffect(() => {
    const { bodyField, resultTitleField } = displaySettings;
    setSearchParameters((currentSearchParameters: DiscoveryV2.QueryParams) => {
      const userReturnParam = currentSearchParameters._return;
      return {
        ...currentSearchParameters,
        _return: uniq(
          compact([
            ...(userReturnParam || []),
            ...BASE_QUERY_RETURN_FIELDS,
            bodyField,
            resultTitleField,
            resultLinkField
          ])
        )
      };
    });
  }, [displaySettings, parameters, resultLinkField, setSearchParameters]);
}

export default withErrorBoundary(
  SearchResults,
  FallbackComponent('SearchResults'),
  onErrorCallback
);
