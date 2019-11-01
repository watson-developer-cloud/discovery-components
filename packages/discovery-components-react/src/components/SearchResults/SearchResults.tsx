import * as React from 'react';
import { SearchApi, SearchContext } from '../DiscoverySearch/DiscoverySearch';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import { TablesOnlyToggle } from './components/TablesOnlyToggle/TablesOnlyToggle';
import { Result } from './components/Result/Result';
import { findCollectionName, getDisplaySettings } from './utils';

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
  tablesOnlyToggleLabelText = 'Show table results only'
}) => {
  const { searchResponse, collectionsResults, componentSettings } = React.useContext(SearchContext);
  const [showTablesOnlyResults, setShowTablesOnlyResults] = React.useState(false);

  const displaySettings = getDisplaySettings(
    { resultTitleField, bodyField, usePassages },
    componentSettings
  );

  const { setSearchParameters } = React.useContext(SearchApi);
  const matchingResults = (searchResponse && searchResponse.matching_results) || 0;
  const results = (searchResponse && searchResponse.results) || [];
  const tableResults = (searchResponse && searchResponse.table_results) || [];
  const querySubmitted = false; // TODO replace this with whatever value tells our component if a query has been submitted

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

  if (matchingResults && matchingResults > 0) {
    return (
      <div>
        <TablesOnlyToggle
          setShowTablesOnlyResults={setShowTablesOnlyResults}
          showTablesOnlyToggle={showTablesOnlyToggle}
          showTablesOnlyResults={showTablesOnlyResults}
          tablesOnlyToggleLabelText={tablesOnlyToggleLabelText}
        />
        {showTablesOnlyResults &&
          (tableResults as DiscoveryV2.QueryTableResult[]).map(table => {
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
          })}
        {!showTablesOnlyResults &&
          (results as DiscoveryV2.QueryResult[]).map(result => {
            const documentTableResult: DiscoveryV2.QueryTableResult | undefined = tableResults.find(
              tableResult => {
                return tableResult.source_document_id === result.document_id;
              }
            );
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
    );
  } else if (searchResponse && matchingResults === 0) {
    return <div>There were no results found</div>;
  } else if (!matchingResults && querySubmitted) {
    return <div>Loading spinner</div>;
  } else {
    return null;
  }
};
