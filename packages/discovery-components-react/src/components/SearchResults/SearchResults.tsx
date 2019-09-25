import React, { useContext } from 'react';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';
import DiscoveryV1 from 'ibm-watson/discovery/v1';

import { Result } from './Result';

export const SearchResults: React.FunctionComponent = () => {
  const { searchResults } = useContext(SearchContext);
  const { matching_results: matchingResults, results } = searchResults;
  const querySubmitted = false; // TODO replace this with whatever value tells our component if a query has been submitted

  if (matchingResults && matchingResults > 0) {
    return (
      <div>
        <h1>Watson found {matchingResults} result(s)</h1>
        {(results as DiscoveryV1.QueryResult[]).map(result => {
          return <Result key={result.document_id} result={result} />;
        })}
      </div>
    );
  } else if (matchingResults === 0) {
    return <div>There were no results found</div>;
  } else if (!matchingResults && querySubmitted) {
    return <div>Loading spinner</div>;
  } else {
    return <div>make a query</div>;
  }
};
