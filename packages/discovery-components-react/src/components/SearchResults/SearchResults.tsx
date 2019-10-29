import React, { useContext, useEffect } from 'react';
import { SearchApi, SearchContext } from '../DiscoverySearch/DiscoverySearch';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
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
   * specify whether or not the Result component should display passages
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
   * specify a label to display instead of 'Collection Name:' on each search Result
   */
  collectionLabel?: string;
  /**
   * Override the default button text for viewing displayed text (either a passage or a defined body field) in the document
   */
  displayedTextInDocumentButtonText?: string;
  /**
   * Override the default button text for viewing a table in the document
   */
  tableInDocumentButtonText?: string;
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
  tableInDocumentButtonText = 'View table in document'
}) => {
  const { searchResponse, collectionsResults, componentSettings } = useContext(SearchContext);

  const displaySettings = getDisplaySettings(
    { resultTitleField, bodyField, usePassages },
    componentSettings
  );

  const { setSearchParameters } = useContext(SearchApi);
  const matchingResults = (searchResponse && searchResponse.matching_results) || 0;
  const results = (searchResponse && searchResponse.results) || [];
  const tableResults = (searchResponse && searchResponse.table_results) || [];
  const querySubmitted = false; // TODO replace this with whatever value tells our component if a query has been submitted

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

  if (matchingResults && matchingResults > 0) {
    return (
      <div>
        {(results as DiscoveryV2.QueryResult[]).map(result => {
          const documentTableResults: DiscoveryV2.QueryTableResult[] = tableResults.filter(
            tableResult => {
              return tableResult.source_document_id === result.document_id;
            }
          );

          const collectionName = findCollectionName(collectionsResults, result.collection_id);

          return (
            <Result
              key={result.document_id}
              result={result}
              resultLinkField={resultLinkField}
              resultLinkTemplate={resultLinkTemplate}
              passageHighlightsClassName={passageHighlightsClassName}
              tableResults={documentTableResults}
              collectionName={collectionName}
              collectionLabel={collectionLabel}
              displayedTextInDocumentButtonText={displayedTextInDocumentButtonText}
              tableInDocumentButtonText={tableInDocumentButtonText}
              bodyField={displaySettings.bodyField}
              usePassages={displaySettings.usePassages}
              resultTitleField={displaySettings.resultTitleField}
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
