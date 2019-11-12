import * as React from 'react';
import { SkeletonText } from 'carbon-components-react';
import { SearchApi, SearchContext } from '../DiscoverySearch/DiscoverySearch';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import { TablesOnlyToggle } from './components/TablesOnlyToggle/TablesOnlyToggle';
import { Result } from './components/Result/Result';
import { SpellingSuggestion } from './components/SpellingSuggestion/SpellingSuggestion';
import { findCollectionName, getDisplaySettings } from './utils';
import {
  baseClass,
  searchResultClass,
  searchResultLoadingClass,
  searchResultsHeaderClass,
  searchResultsListClass
} from './cssClasses';

export interface SearchResultsProps {
  /**
   * specify a field on the result object to pull the result title from
   */
  resultTitleField?: string;
  /**
   * specify a field on the result object to pull the result link from
   */
  resultLinkField?: string;
  /**
   * specify a string template using mustache templating syntax https://github.com/janl/mustache.js to create the title from each result object
   */
  resultLinkTemplate?: string;
  /**
   * specify a field on the result object to pull the displayed text from
   */
  bodyField?: string;
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
   * specify a className for styling <em> tags within passages
   */
  passageHighlightsClassName?: string;
  /**
   * specify a label to display instead of 'Collection Name:' on each search result
   */
  collectionLabel?: string;
  /**
   * override the default button text for viewing displayed text (either a passage or a defined bodyfield) in the document
   */
  displayedTextInDocumentButtonText?: string;
  /**
   * override the default button text for viewing a table in the document
   */
  tableInDocumentButtonText?: string;
  /**
   * specify whether to display a toggle for showing table search results only
   */
  showTablesOnlyToggle?: boolean;
  /**
   * override the default label text for the show tables only toggle
   */
  tablesOnlyToggleLabelText?: string;
  /**
   * Message prefix used when displaying spelling suggestion
   */
  spellingSuggestionsPrefix?: string;
  /**
   * override the default text to show when no search results are found
   */
  noResultsFoundText?: string;
}

export const SearchResults: React.FunctionComponent<SearchResultsProps> = ({
  resultLinkField,
  resultLinkTemplate,
  resultTitleField,
  bodyField,
  usePassages,
  passageLength,
  passageHighlightsClassName,
  collectionLabel = 'Collection Name:',
  displayedTextInDocumentButtonText = 'View passage in document',
  tableInDocumentButtonText = 'View table in document',
  showTablesOnlyToggle = false,
  tablesOnlyToggleLabelText = 'Show table results only',
  spellingSuggestionsPrefix = 'Did you mean:',
  noResultsFoundText = 'There were no results found'
}) => {
  const DEFAULT_LOADING_COUNT = 3;
  const {
    searchResponseStore: { data: searchResponse, isLoading, parameters },
    collectionsResults,
    componentSettings
  } = React.useContext(SearchContext);
  const [showTablesOnlyResults, setShowTablesOnlyResults] = React.useState(false);

  const displaySettings = getDisplaySettings(
    { resultTitleField, bodyField, usePassages },
    componentSettings
  );

  const { setSearchParameters } = React.useContext(SearchApi);
  const matchingResults = (searchResponse && searchResponse.matching_results) || 0;
  const results = (searchResponse && searchResponse.results) || [];
  const tableResults = (searchResponse && searchResponse.table_results) || [];
  const searchResultLoadingClasses = [searchResultClass, searchResultLoadingClass];
  const emptySearch = searchResponse ? noResultsFoundText : '';

  React.useEffect(() => {
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

  return (
    <div className={baseClass}>
      <div className={searchResultsHeaderClass} data-testid="search_results_header">
        <SpellingSuggestion spellingSuggestionPrefix={spellingSuggestionsPrefix} />
        <TablesOnlyToggle
          setShowTablesOnlyResults={setShowTablesOnlyResults}
          showTablesOnlyToggle={showTablesOnlyToggle}
          showTablesOnlyResults={showTablesOnlyResults}
          tablesOnlyToggleLabelText={tablesOnlyToggleLabelText}
        />
      </div>
      {isLoading ? (
        [...new Array(Math.min(parameters.count || DEFAULT_LOADING_COUNT))].map((_, i) => {
          return (
            <div
              className={searchResultLoadingClasses.join(' ')}
              data-testid="skeleton_text"
              key={`skeleton_${i}`}
            >
              <SkeletonText paragraph width={'85%'} />
            </div>
          );
        })
      ) : matchingResults && matchingResults > 0 ? (
        <div className={searchResultsListClass}>
          {showTablesOnlyResults
            ? (tableResults as DiscoveryV2.QueryTableResult[]).map(table => {
                const collectionName = findCollectionName(collectionsResults, table);

                return (
                  <Result
                    key={table.table_id}
                    bodyField={displaySettings.bodyField}
                    collectionLabel={collectionLabel}
                    collectionName={collectionName}
                    displayedTextInDocumentButtonText={displayedTextInDocumentButtonText}
                    resultLinkField={resultLinkField}
                    resultLinkTemplate={resultLinkTemplate}
                    resultTitleField={displaySettings.resultTitleField}
                    showTablesOnlyResults={showTablesOnlyResults}
                    table={table}
                    tableInDocumentButtonText={tableInDocumentButtonText}
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
                    key={result.document_id}
                    bodyField={displaySettings.bodyField}
                    collectionLabel={collectionLabel}
                    collectionName={collectionName}
                    displayedTextInDocumentButtonText={displayedTextInDocumentButtonText}
                    passageHighlightsClassName={passageHighlightsClassName}
                    result={result}
                    resultLinkField={resultLinkField}
                    resultLinkTemplate={resultLinkTemplate}
                    resultTitleField={displaySettings.resultTitleField}
                    table={documentTableResult}
                    tableInDocumentButtonText={tableInDocumentButtonText}
                    usePassages={displaySettings.usePassages}
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
