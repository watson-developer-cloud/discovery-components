import * as React from 'react';
import { Pagination as CarbonPagination } from 'carbon-components-react';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';

interface ResultsPaginationProps {
  /**
   * Array of available result counts to show per page
   */
  pageSizes: Array<number>;
}

interface ResultsPaginationEvent {
  page: number;
  pageSize: number;
}

export const ResultsPagination: React.SFC<ResultsPaginationProps> = ({ pageSizes }) => {
  const searchContext = React.useContext(SearchContext);
  const matchingResults = searchContext.searchResults.matching_results || 0;

  const handleOnChange = (evt: ResultsPaginationEvent): void => {
    const { page, pageSize } = evt;
    const offset = (page - 1) * pageSize;
    searchContext.onUpdateResultsPagination(offset);
    searchContext.onSearch();
  };

  return (
    <CarbonPagination
      totalItems={matchingResults}
      pageSizes={pageSizes || [10, 20, 30, 40, 50]}
      onChange={handleOnChange}
    />
  );
};
