import React, { FC, useContext, useState, useEffect } from 'react';
import { unstable_Pagination as CarbonPagination } from 'carbon-components-react';
import { SearchApi, SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { settings } from 'carbon-components';
import { withErrorBoundary } from 'react-error-boundary';
import { FallbackComponent } from 'utils/FallbackComponent';
import onErrorCallback from 'utils/onErrorCallback';
import { defaultMessages, Messages } from './messages';
import { formatMessage } from 'utils/formatMessage';

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
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages?: Partial<Messages>;
  /**
   * custom handler invoked when any input element changes in the ResultsPagination component
   */
  onChange?: (e: ResultsPaginationEvent) => void;
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

const ResultsPagination: FC<ResultsPaginationProps> = ({
  page = 1,
  pageSizes = [10, 20, 30, 40, 50],
  pageSize,
  showPageSizeSelector = true,
  messages = defaultMessages,
  onChange,
  ...inputProps
}) => {
  const mergedMessages = { ...defaultMessages, ...messages };
  const { performSearch, setSearchParameters } = useContext(SearchApi);
  const {
    searchResponseStore: { data: searchResponse, parameters: searchParameters },
    componentSettings,
    isResultsPaginationComponentHidden
  } = useContext(SearchContext);
  const [currentPage, setCurrentPage] = useState(page);
  const resultsPerPage = componentSettings?.results_per_page ?? 10;

  useEffect(() => {
    if (!!pageSize || !!resultsPerPage) {
      setSearchParameters((currentSearchParameters: DiscoveryV2.QueryParams) => {
        return { ...currentSearchParameters, count: pageSize || resultsPerPage };
      });
    }
  }, [setSearchParameters, pageSize, resultsPerPage]);

  useEffect(() => {
    const actualPageSize = searchParameters.count || 10;
    const actualOffset = searchParameters.offset || 0;
    const pageFromOffset = Math.floor(actualOffset / actualPageSize) + 1;
    if (currentPage !== pageFromOffset) {
      setCurrentPage(pageFromOffset);
    }
  }, [currentPage, searchParameters.count, searchParameters.offset]);

  const matchingResults = (searchResponse && searchResponse.matching_results) || undefined;
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
    if (onChange) {
      onChange(evt);
    }
    const { page, pageSize } = evt;
    const offset = (page - 1) * pageSize;
    setCurrentPage(page);
    performSearch(
      {
        ...searchParameters,
        count: pageSize,
        offset
      },
      false
    );
  };

  const handleItemRangeText = (min: number, max: number, total: number) =>
    formatMessage(mergedMessages.itemRangeText, { min, max, total }, false);

  const handlePageRangeText = (_current: number, total: number) =>
    formatMessage(mergedMessages.pageRangeText, { total }, false);

  const handlePageText = (page: number) => formatMessage(mergedMessages.pageText, { page }, false);

  if (!!componentSettings) {
    return (
      <>
        {!isResultsPaginationComponentHidden && (
          <CarbonPagination
            className={classNames.join(' ')}
            initialPage={currentPage}
            totalItems={matchingResults}
            pageSize={actualPageSize}
            pageSizes={pageSizes}
            onChange={handleOnChange}
            itemRangeText={handleItemRangeText}
            itemsPerPageText={mergedMessages.itemsPerPageText}
            pageRangeText={handlePageRangeText}
            pageText={handlePageText}
            {...inputProps}
          />
        )}
      </>
    );
  }

  return null;
};

export default withErrorBoundary(
  ResultsPagination,
  FallbackComponent('ResultsPagination'),
  onErrorCallback
);
