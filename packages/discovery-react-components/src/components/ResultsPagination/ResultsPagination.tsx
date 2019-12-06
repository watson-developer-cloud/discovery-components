import React, { FC, useContext, useEffect } from 'react';
import { Pagination as CarbonPagination } from 'carbon-components-react';
import { SearchApi, SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import get from 'lodash/get';
import { settings } from 'carbon-components';

export interface ResultsPaginationProps {
  /**
   * The current page
   */
  page?: number;
  /**
   * Number of items per page
   */
  pageSize?: number;
  /**
   * Choices of `pageSize`
   */
  pageSizes?: Array<number>;
  /**
   * Specify whether to show the selector for dynamically changing `pageSize`
   */
  showPageSizeSelector?: boolean;
  /**
   * Additional props to be passed into Carbon's Pagination component
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ResultsPaginationEvent {
  page: number;
  pageSize: number;
}

export const ResultsPagination: FC<ResultsPaginationProps> = ({
  page = 1,
  pageSizes = [10, 20, 30, 40, 50],
  pageSize,
  showPageSizeSelector = true,
  ...inputProps
}) => {
  const { performSearch, setSearchParameters } = useContext(SearchApi);
  const {
    searchResponseStore: { data: searchResponse, parameters: searchParameters },
    componentSettings,
    isResultsPaginationComponentHidden
  } = useContext(SearchContext);

  const resultsPerPage = get(componentSettings, 'results_per_page', 10);
  useEffect(() => {
    if (!!pageSize || !!resultsPerPage) {
      setSearchParameters((currentSearchParameters: DiscoveryV2.QueryParams) => {
        return { ...currentSearchParameters, count: pageSize || resultsPerPage };
      });
    }
  }, [setSearchParameters, pageSize, resultsPerPage]);

  const matchingResults = (searchResponse && searchResponse.matching_results) || 0;
  const actualPageSize = searchParameters.count || 10;
  // the default behavior of Carbon is to discard pageSize if it is not included in pageSizes,
  // we instead choose to make it so that pageSize is appended to pageSizes if it is not already included.
  if (!pageSizes.includes(actualPageSize)) {
    pageSizes.push(actualPageSize);
    pageSizes = pageSizes.sort((a, b) => a - b);
  }

  const classNames = [`${settings.prefix}--pagination`];
  if (!showPageSizeSelector) {
    classNames.push(`${settings.prefix}--pagination__page-size-selector--hidden`);
  }

  const handleOnChange = (evt: ResultsPaginationEvent): void => {
    const { page, pageSize } = evt;
    const offset = (page - 1) * pageSize;
    performSearch(
      {
        ...searchParameters,
        count: pageSize,
        offset
      },
      false
    );
  };

  const handleItemRangeText = (min: number, max: number, total: number) => {
    return `${min}–${max} of ${total} results`;
  };

  if (!!componentSettings) {
    return (
      <>
        {!isResultsPaginationComponentHidden && (
          <CarbonPagination
            className={classNames.join(' ')}
            page={page}
            totalItems={matchingResults}
            pageSize={actualPageSize}
            pageSizes={pageSizes}
            onChange={handleOnChange}
            itemRangeText={handleItemRangeText}
            {...inputProps}
          />
        )}
      </>
    );
  }

  return null;
};

export default ResultsPagination;
