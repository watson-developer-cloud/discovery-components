import React, { FC, useContext } from 'react';
import { Pagination as CarbonPagination } from 'carbon-components-react';
import { SearchApi, SearchContext } from '../DiscoverySearch/DiscoverySearch';
import get from 'lodash/get';

interface ResultsPaginationProps {
  /**
   * Current page displayed
   */
  page: number;
  /**
   * page size to use
   */
  pageSize?: number;
  /**
   * Array of available result counts to show per page
   */
  pageSizes: Array<number>;
}

interface ResultsPaginationEvent {
  page: number;
  pageSize: number;
}

export const ResultsPagination: FC<ResultsPaginationProps> = ({ page, pageSizes, pageSize }) => {
  const { performSearch } = useContext(SearchApi);
  const { searchParameters, searchResponse, componentSettings } = useContext(SearchContext);
  const matchingResults = (searchResponse && searchResponse.matching_results) || 0;
  const displaySettings = {
    pageSize: pageSize || get(componentSettings, 'results_per_page')
  };
  // the default behavior of Carbon is to discard pageSize if it is not included in pageSizes,
  // we instead choose to make it so that pageSize is appended to pageSizes if it is not already included.
  if (displaySettings.pageSize && !pageSizes.includes(displaySettings.pageSize)) {
    pageSizes.push(displaySettings.pageSize);
    pageSizes = pageSizes.sort();
  }

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
      pageSize={displaySettings.pageSize}
      onChange={handleOnChange}
    />
  );
};

ResultsPagination.defaultProps = {
  page: 1,
  pageSizes: [10, 20, 30, 40, 50]
};

export default ResultsPagination;
