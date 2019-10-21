import React, { useContext } from 'react';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';
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
  const { searchResults, onUpdateQueryOptions, collectionsResults } = useContext(SearchContext);
  const { matching_results: matchingResults, results } = searchResults;
  const querySubmitted = false; // TODO replace this with whatever value tells our component if a query has been submitted

  React.useEffect(() => {
    if (passageLength) {
      onUpdateQueryOptions({
        passages: {
          characters: passageLength,
          enabled: true
        }
      });
    }
  }, [passageLength]);

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
  } else if (matchingResults === 0) {
    return <div>There were no results found</div>;
  } else if (!matchingResults && querySubmitted) {
    return <div>Loading spinner</div>;
  } else {
    return null;
  }
};
