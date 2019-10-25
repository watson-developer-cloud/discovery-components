import React, { FC, useContext } from 'react';
import { Pagination as CarbonPagination } from 'carbon-components-react';
import { SearchApi, SearchContext } from '../DiscoverySearch/DiscoverySearch';

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

export const ResultsPagination: FC<ResultsPaginationProps> = ({ page, pageSizes }) => {
  const { performSearch } = useContext(SearchApi);
  const { searchParameters, searchResponse } = useContext(SearchContext);
  const matchingResults = (searchResponse && searchResponse.matching_results) || 0;

  const handleOnChange = (evt: ResultsPaginationEvent): void => {
    const { page, pageSize } = evt;
    const offset = (page - 1) * pageSize;
    performSearch({ ...searchParameters, offset }, false);
  };

  return (
    <CarbonPagination
      page={page}
      totalItems={matchingResults}
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
