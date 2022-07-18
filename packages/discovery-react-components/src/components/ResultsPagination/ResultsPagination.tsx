import React, {
  FC,
  useContext,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  ForwardedRef
} from 'react';
import { unstable_Pagination as CarbonPagination } from 'carbon-components-react';
import cx from 'classnames';
import { SearchApi, SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { settings } from 'carbon-components';
import { withErrorBoundary } from 'react-error-boundary';
import { FallbackComponent } from 'utils/FallbackComponent';
import onErrorCallback from 'utils/onErrorCallback';
import { defaultMessages, Messages } from './messages';
import { formatMessage } from 'utils/formatMessage';

/**
 * A pagination component to allow users to navigate through multiple pages of results
 *
 * Externalizes a reset function through an imperative API (via the `ref` prop) that resets the component to page 1.
 */

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
   * Reference to imperative API
   */
  apiRef?: ForwardedRef<ResultsPaginationAPI>;
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

export interface ResultsPaginationAPI {
  reset: (options: ResetOptions) => void;
}

interface ResetOptions {
  triggerOnChange?: boolean;
}

const ResultsPagination: FC<ResultsPaginationProps> = ({
  page = 1,
  pageSizes = [10, 20, 30, 40, 50],
  pageSize,
  showPageSizeSelector = true,
  messages = defaultMessages,
  onChange,
  apiRef,
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
  const [resetCounter, setResetCounter] = useState(0);
  const resultsPerPage = pageSize || searchParameters.count || 10;

  const handleOnChange = useCallback(
    (evt: ResultsPaginationEvent): void => {
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
    },
    [onChange, performSearch, searchParameters]
  );

  // Since the Carbon pagination component controls the page number via its state
  // without a way to influence it via props, we occasionally need to reset it back to "Page 1".
  // This is done via a key on the CarbonPagination element, which is triggered via a counter
  // that is incremented by this function.
  const reset = useCallback(
    ({ triggerOnChange }: ResetOptions) => {
      setCurrentPage(1);
      // This is structured as a counter so that the `key` prop of the Carbon pagination component
      // updates (triggering a full re-render) in a simple and performant manner
      setResetCounter(resetCounter + 1);
      if (triggerOnChange) {
        handleOnChange({ page: 1, pageSize: resultsPerPage });
      }
    },
    [handleOnChange, resetCounter, resultsPerPage]
  );

  // Externalize the reset function to a ref that the parent can send in,
  // so that it can also reset the pagination as desired
  useImperativeHandle(apiRef, () => ({ reset }));

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
      if (pageFromOffset === 1) {
        reset({});
      }
    }
  }, [currentPage, searchParameters.count, searchParameters.offset, reset]);

  const matchingResults = (searchResponse && searchResponse.matching_results) || undefined;

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
            className={cx(`${settings.prefix}--pagination`, {
              [`${settings.prefix}--pagination__page-size-selector--hidden`]: !showPageSizeSelector
            })}
            totalItems={matchingResults}
            pageSize={resultsPerPage}
            pageSizes={pageSizes}
            // NOTE: See PageSelector below for details about `onChange`
            onChange={handleOnChange}
            itemRangeText={handleItemRangeText}
            itemsPerPageText={mergedMessages.itemsPerPageText}
            pageRangeText={handlePageRangeText}
            pageText={handlePageText}
            key={resetCounter}
            {...inputProps}
          >
            {(props: PageSelectorProps) => <PageSelector {...props} onChange={handleOnChange} />}
          </CarbonPagination>
        )}
      </>
    );
  }

  return null;
};

// XXX Slight hack. unstable_Pagination's `onChange` only fires when clicking next/prev buttons,
//     but _not_ when changing the page size. For that reason, we use a custom PageSelector to track
//     this state and call `handlOnChange` when necessary.
type PageSelectorProps = {
  currentPage: number;
  currentPageSize: number;
  onSetPage: Function;
  onChange: Function;
};

function PageSelector({ currentPage, currentPageSize, onSetPage, onChange }: PageSelectorProps) {
  const [pageSize, setPageSize] = useState(currentPageSize);

  useEffect(() => {
    if (currentPageSize !== pageSize) {
      setPageSize(currentPageSize);

      onChange({
        page: 1,
        pageSize: currentPageSize
      });
      // update unstable_Pagination state
      onSetPage(1);
    }
  }, [currentPageSize, onChange, onSetPage, pageSize]);

  return (
    <span className={`${settings.prefix}--unstable-pagination__text`} data-testid="current-page">
      {currentPage}
    </span>
  );
}

const ResultsPaginationWithBoundary = withErrorBoundary<ResultsPaginationProps>(
  ResultsPagination,
  FallbackComponent('ResultsPagination'),
  onErrorCallback
);
export default forwardRef<any, ResultsPaginationProps>((props, ref) => {
  return <ResultsPaginationWithBoundary {...props} apiRef={ref} />;
});
