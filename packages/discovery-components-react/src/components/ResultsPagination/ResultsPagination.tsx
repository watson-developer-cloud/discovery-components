import * as React from 'react';
import { Pagination as CarbonPagination } from 'carbon-components-react';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';

interface ResultsPaginationProps {
  /**
   * Current page displayed
   */
  page: number;

  /**
   * Array of available result counts to show per page
   */
  pageSizes: Array<number>;
}

interface ResultsPaginationEvent {
  page: number;
  pageSize: number;
}

export const ResultsPagination: React.SFC<ResultsPaginationProps> = ({ page, pageSizes }) => {
  const searchContext = React.useContext(SearchContext);
  const {
    onUpdateResultsPagination,
    onSearch,
    searchResults: { matching_results: matchingResults }
  } = searchContext;

  const handleOnChange = (evt: ResultsPaginationEvent): void => {
    const { page, pageSize } = evt;
    const offset = (page - 1) * pageSize;
    onUpdateResultsPagination(offset);
    onSearch();
  };

  return (
    <CarbonPagination
      page={page}
      totalItems={matchingResults || 0}
      pageSizes={pageSizes}
      onChange={handleOnChange}
    />
  );
};

ResultsPagination.defaultProps = {
  page: 1,
  pageSizes: [10, 20, 30, 40, 50]
};

export default ResultsPagination;
