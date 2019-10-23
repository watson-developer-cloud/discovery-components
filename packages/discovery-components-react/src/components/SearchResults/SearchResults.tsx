import React, { useContext, useEffect } from 'react';
import { SearchApi, SearchContext } from '../DiscoverySearch/DiscoverySearch';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

import { Result } from './Result';
import { findCollectionName } from './utils/findCollectionName';

interface SearchResultsProps {
  /**
   * specify a field on the result object to pull the result title from
   */
  resultTitleField?: string;
  /**
   * specify a field on the result object to pull the result link from
   */
  resultLinkField?: string;
  /**
   * specify a string template using mustache templating syntax https://github.com/janl/mustache.js to pull the result link from
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
}

export const SearchResults: React.FunctionComponent<SearchResultsProps> = ({
  resultLinkField,
  resultLinkTemplate,
  resultTitleField = 'extracted_metadata.title',
  bodyField = 'text',
  usePassages = true,
  passageLength,
  passageHighlightsClassName,
  collectionLabel = 'Collection Name:'
}) => {
  const { searchResponse, collectionsResults } = useContext(SearchContext);
  const { setSearchParameters } = useContext(SearchApi);
  const matchingResults = (searchResponse && searchResponse.matching_results) || 0;
  const results = (searchResponse && searchResponse.results) || [];
  const querySubmitted = false; // TODO replace this with whatever value tells our component if a query has been submitted

  useEffect(() => {
    if (passageLength) {
      setSearchParameters((currentSearchParameters: DiscoveryV1.QueryParams) => {
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
        {(results as DiscoveryV1.QueryResult[]).map(result => {
          const collectionName = findCollectionName(collectionsResults, result.collection_id);
          return (
            <Result
              key={result.document_id}
              result={result}
              resultTitleField={resultTitleField}
              resultLinkField={resultLinkField}
              resultLinkTemplate={resultLinkTemplate}
              bodyField={bodyField}
              usePassages={usePassages}
              passageHighlightsClassName={passageHighlightsClassName}
              collectionName={collectionName}
              collectionLabel={collectionLabel}
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
