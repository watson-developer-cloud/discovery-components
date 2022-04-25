import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import { SearchClient } from 'components/DiscoverySearch/types';
import { deprecateReturnFields } from 'utils/deprecation';

/**
 * generic reducer to handle updating loading, error, and data
 * @param state - incoming state to modify
 * @param action - contains type of action as well as payload to store in the reducer (if any)
 */
const dataFetchReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return {
        ...state,
        isLoading: true,
        isError: false,
        error: null
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        error: null,
        data: action.payload
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
        error: action.error || null
      };
    default:
      throw new Error();
  }
};

/**
 * interface to explain the return value of useDataApi
 */
interface UseDataApiReturn<T, U> {
  /**
   * similar to useReducer, state is where the data and loading/error information live
   */
  state: any;
  /**
   * parameters are sent to the API for the corresponding SDK method
   */
  parameters: T;
  /**
   * a method used to update the parameters that are sent to the API
   */
  setParameters: React.Dispatch<React.SetStateAction<T>>;
  /**
   * a method that can be used to override the data attribute directly
   */
  setData: (value?: U) => void;
  /**
   * a method that is used to invoke the API call with whatever parameters are currently stored
   */
  setFetchToken: React.Dispatch<React.SetStateAction<FetchToken>>;
}

/**
 * a token used to invoke the API and optionally return data to its caller
 */
interface FetchToken {
  /**
   * dummy parameter used to trigger the useEffect that will invoke the API call
   */
  trigger: boolean;
  /**
   * optional function called on successful API response with the response data
   */
  callback?: (data: any) => void;
  /**
   * optional parameter to determine whether to store successful response data
   */
  storeResult?: boolean;
}

/**
 * Custom hook that fetches and stores data while handling complex condidions such as:
 * - request cancellation
 * - latest data fetching
 * - error handling
 * @param initialParameters - initial parameters used with this API
 * @param initialData - initial response data for this API
 * @param searchClientMethod - api method reference on the searchClient
 * @param searchClient - the client used to do data fetching
 */
const useDataApi = <T, U>(
  initialParameters: T,
  searchClientMethod: (params: T, callback?: any) => void | Promise<any>,
  searchClient: SearchClient,
  initialData?: U,
  transformResult?: (result: any) => U
): UseDataApiReturn<T, U> => {
  // useRef stores state without rerenders
  // token to pass by reference instead of by value to keep track of cancellation state on unmount
  const cancelToken = useRef(false);
  // counter to keep track of the most recent API request
  const requestIdRef = useRef(0);
  // token used to invoke the API call and optionally return the response data to the callback
  const [fetchToken, setFetchToken] = useState<FetchToken>({ trigger: false, callback: undefined });
  const [parameters, setParameters] = useState<T>(initialParameters);
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
    error: null
  });

  const setData = (data?: U): void => {
    dispatch({ type: 'FETCH_SUCCESS', payload: data });
  };

  const fetchData = useCallback(
    async (parameters, requestId, callback, storeResult = true): Promise<void> => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { result } = await searchClientMethod.call(searchClient, parameters);
        // before storing the data, make sure the component hasn't been unmounted
        // and make sure this request is the most recent one (discard old requests)
        if (!cancelToken.current && requestId === requestIdRef.current) {
          let payload = result;
          if (transformResult) {
            payload = transformResult(result);
          }
          if (storeResult) {
            dispatch({ type: 'FETCH_SUCCESS', payload });
          }
          if (callback) {
            callback(payload);
          }
        }
      } catch (error) {
        if (!cancelToken.current) {
          dispatch({ type: 'FETCH_FAILURE', error });
        }
      }
    },
    [searchClient, searchClientMethod, transformResult]
  );

  // in order to prevent state updates after component unmount, set the cancel token
  // need pass by reference to allow us to change it before unmount
  useEffect(() => {
    return (): void => {
      cancelToken.current = true;
    };
  }, []);

  // this effect invokes the API by changing whenever fetchToken is updated
  useEffect(() => {
    if (fetchToken.trigger) {
      requestIdRef.current++;
      // pass the request id by value
      fetchData(parameters, requestIdRef.current, fetchToken.callback, fetchToken.storeResult);
      setFetchToken({ trigger: false, callback: undefined });
    }
  }, [fetchToken, fetchData, parameters]);

  return { state, parameters, setParameters, setData, setFetchToken };
};

/**
 * default reducer shape to be extended by concrete stores
 */
interface ReducerState {
  isLoading: boolean;
  isError: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: any;
  error: Error | null;
}

/**
 * concrete implementation of the reducer state for fetchFields
 */
export interface FieldsStore extends ReducerState {
  data: DiscoveryV2.ListFieldsResponse | null;
  parameters: DiscoveryV2.ListFieldsParams;
}

/**
 * actions used to interact with the fields api and fields state
 */
export interface FieldsStoreActions {
  /**
   * method used to invoke the search request with an optional callback to return the response data
   */
  fetchFields: () => void;
  setFieldsResponse: (overrideResults?: DiscoveryV2.ListFieldsResponse) => void;
}

/**
 * Concrete usage of the useDataApi helper method for fetching project fields
 * @param fetchFieldsParams - initial search parameters to set
 * @param searchClient - search client used to perform requests
 * @return a 2-element array containing the fields store data and fields-specific store actions
 */

export const useFieldsApi = (
  fetchFieldsParams: DiscoveryV2.ListFieldsParams,
  searchClient: SearchClient
): [FieldsStore, FieldsStoreActions] => {
  const {
    state: fieldsState,
    setData: setFieldsResponse,
    setFetchToken
  } = useDataApi<DiscoveryV2.ListFieldsParams, DiscoveryV2.ListFieldsResponse>(
    fetchFieldsParams,
    searchClient.listFields,
    searchClient
  );

  const fetchFields = useCallback(() => setFetchToken({ trigger: true }), [setFetchToken]);

  return [
    fieldsState,
    {
      fetchFields,
      setFieldsResponse
    }
  ];
};

/**
 * concrete implementation of the reducer state for search
 */
export interface SearchResponseStore extends ReducerState {
  data: DiscoveryV2.QueryResponse | null;
  parameters: DiscoveryV2.QueryParams;
}

/**
 * search-specific actions used to interact with the search API and search state
 */
export interface SearchResponseStoreActions {
  /**
   * method to set the parameters to be used with the search API when performSearch is invoked
   */
  setSearchParameters: React.Dispatch<
    React.SetStateAction<DiscoveryV2.QueryParams & { returnFields?: string[] }>
  >;
  /**
   * method to override the current search response
   */
  setSearchResponse: (overrideSearchResponse?: DiscoveryV2.QueryResponse) => void;
  /**
   * method used to invoke the search request with an optional callback to return the response data
   */
  performSearch: (callback?: (result: any) => void) => void;
}

/**
 * concrete usage of the useDataApi helper method for search
 * @param searchParameters - initial search parameters to set
 * @param overrideSearchResults - initial search results to set
 * @param searchClient - search client used to perform requests
 * @return a 2-element array containing the search store data and search-specific store actions
 */
export const useSearchResultsApi = (
  searchParameters: DiscoveryV2.QueryParams & { returnFields?: string[] },
  searchClient: SearchClient,
  overrideSearchResults?: DiscoveryV2.QueryResponse
): [SearchResponseStore, SearchResponseStoreActions] => {
  const {
    state: searchState,
    parameters: currentSearchParameters,
    setParameters: setSearchParametersBackwardsCompatible,
    setData: setSearchResponse,
    setFetchToken
  } = useDataApi<DiscoveryV2.QueryParams, DiscoveryV2.QueryResponse>(
    deprecateReturnFields(searchParameters) as DiscoveryV2.QueryParams,
    searchClient.query,
    searchClient,
    overrideSearchResults
  );
  const setSearchParameters: SearchResponseStoreActions['setSearchParameters'] = useCallback(
    backwardsCompatibleSearchParameters => {
      // if backwardsCompatibleSearchParameters is a function, we cannot modify the parameters, call it with previous state
      if (typeof backwardsCompatibleSearchParameters === 'function') {
        setSearchParametersBackwardsCompatible(prevState => {
          return deprecateReturnFields(
            backwardsCompatibleSearchParameters(prevState)
          ) as DiscoveryV2.QueryParams;
        });
      } else {
        // otherwise just modify the object
        setSearchParametersBackwardsCompatible(
          deprecateReturnFields(backwardsCompatibleSearchParameters) as DiscoveryV2.QueryParams
        );
      }
    },
    [setSearchParametersBackwardsCompatible]
  );

  // callback can be passed in here to return back data to the invoker of the search
  // in the specific case here, we need to set our aggregation store after performing a search
  const performSearch: SearchResponseStoreActions['performSearch'] = useCallback(
    callback => setFetchToken({ trigger: true, callback }),
    [setFetchToken]
  );

  return [
    {
      ...searchState,
      parameters: currentSearchParameters
    },
    {
      setSearchParameters,
      setSearchResponse,
      performSearch
    }
  ];
};

/**
 * concrete implementation of the reducer state for fetch aggregations
 */
export interface GlobalAggregationsResponseStore extends ReducerState {
  data: DiscoveryV2.QueryAggregation[] | null;
  parameters: DiscoveryV2.QueryParams;
}

/**
 * fetch aggregations actions used to interact with the search API and search state
 */
export interface GlobalAggregationsStoreActions {
  /**
   * method to set the parameters to be used with the search API when fetchAggregations is invoked
   */
  setGlobalAggregationParameters: React.Dispatch<React.SetStateAction<DiscoveryV2.QueryParams>>;
  /**
   * method to override the current aggregations
   */
  setGlobalAggregationsResponse: (aggregationsResponse?: DiscoveryV2.QueryAggregation[]) => void;
  /**
   * method used to invoke the aggregations request with search parameters and an optional callback to return the response data
   */
  fetchGlobalAggregations: (
    searchParameters: DiscoveryV2.QueryParams,
    callback?: (result: DiscoveryV2.QueryAggregation[]) => void
  ) => void;
  /**
   * method used to invoke the aggregations request without storing the data with search parameters and an optional callback to return the response data
   */
  fetchGlobalAggregationsWithoutStoring: (
    searchParameters: DiscoveryV2.QueryParams,
    callback?: (result: DiscoveryV2.QueryAggregation[]) => void
  ) => void;
}

export const useGlobalAggregationsApi = (
  searchParameters: DiscoveryV2.QueryParams,
  searchClient: SearchClient,
  overrideAggregationResults?: DiscoveryV2.QueryAggregation[]
): [GlobalAggregationsResponseStore, GlobalAggregationsStoreActions] => {
  const {
    state: aggregationState,
    parameters: currentGlobalAggregationParameters,
    setParameters: setGlobalAggregationParameters,
    setData: setGlobalAggregationsResponse,
    setFetchToken
  } = useDataApi<DiscoveryV2.QueryParams, DiscoveryV2.QueryAggregation[]>(
    searchParameters,
    searchClient.query,
    searchClient,
    overrideAggregationResults,
    (result: DiscoveryV2.QueryResponse) => result.aggregations || []
  );

  const fetchGlobalAggregations: GlobalAggregationsStoreActions['fetchGlobalAggregations'] =
    useCallback(
      (searchParameters, callback) => {
        setGlobalAggregationParameters(searchParameters);
        setFetchToken({ trigger: true, callback });
      },
      [setFetchToken, setGlobalAggregationParameters]
    );

  // allow us to chain the result without storing in our reducer state
  // used alongside the fetchTypeForTopEntitiesAggregation
  const fetchGlobalAggregationsWithoutStoring: GlobalAggregationsStoreActions['fetchGlobalAggregationsWithoutStoring'] =
    useCallback(
      (searchParameters, callback) => {
        setGlobalAggregationParameters(searchParameters);
        setFetchToken({ trigger: true, callback, storeResult: false });
      },
      [setFetchToken, setGlobalAggregationParameters]
    );

  return [
    {
      ...aggregationState,
      parameters: currentGlobalAggregationParameters
    },
    {
      setGlobalAggregationParameters,
      setGlobalAggregationsResponse,
      fetchGlobalAggregations,
      fetchGlobalAggregationsWithoutStoring
    }
  ];
};

/**
 * concrete implementation of the reducer state for fetch documents
 */
export interface FetchDocumentsResponseStore extends ReducerState {
  data: DiscoveryV2.QueryResponse | null;
  parameters: DiscoveryV2.QueryParams;
}

/**
 * fetch documents actions used to interact with the search API and search state
 */
export interface FetchDocumentsActions {
  /**
   * method used to invoke the search request with a callback to return the response data
   */
  fetchDocuments: (
    filter: string,
    collections: string[],
    callback: (result: DiscoveryV2.QueryResponse) => void
  ) => void;
}

/**
 * concrete usage of the useDataApi helper method for fetching individual documents
 * @param searchParameters - initial search parameters to set
 * @param searchClient - search client used to perform requests
 * @return a 2-element array containing the fetch documents store data and fetchDocuments-specific store actions
 */
export const useFetchDocumentsApi = (
  searchParameters: DiscoveryV2.QueryParams,
  searchClient: SearchClient
): [FetchDocumentsResponseStore, FetchDocumentsActions] => {
  const {
    state: searchState,
    setParameters: setSearchParameters,
    setFetchToken
  } = useDataApi<DiscoveryV2.QueryParams, DiscoveryV2.QueryResponse>(
    searchParameters,
    searchClient.query,
    searchClient
  );

  const fetchDocuments: FetchDocumentsActions['fetchDocuments'] = useCallback(
    (filter, collections, callback) => {
      setSearchParameters((currentSearchParameters: DiscoveryV2.QueryParams) => {
        return { ...currentSearchParameters, filter, collection_ids: collections };
      });
      setFetchToken({ trigger: true, callback });
    },
    [setSearchParameters, setFetchToken]
  );

  return [
    searchState,
    {
      fetchDocuments
    }
  ];
};

/**
 * concrete implementation of the reducer state for fetch documents
 */
export interface AutocompleteStore extends ReducerState {
  data: DiscoveryV2.Completions | null;
  parameters: DiscoveryV2.GetAutocompletionParams;
}

/**
 * autocomplete actions used to interact with the autocomplete API and autocomplete state
 */
export interface AutocompleteActions {
  setAutocompletions: (data?: DiscoveryV2.Completions) => void;
  /**
   * method used to invoke the async autocomplete request
   */
  fetchAutocompletions: (autocompleteParameters: DiscoveryV2.GetAutocompletionParams) => void;
}

/**
 * concrete usage of the useDataApi helper method for fetching autocompletions
 * @param autocompleteParmeters - initial autocomplete parameters to set
 * @param searchClient - search client used to perform requests
 * @param overrideAutocompletions - initial autocomplete results to set
 * @return a 2-element array containing the autocomplete store data and autocomplete-specific store actions
 */
export const useAutocompleteApi = (
  autocompleteParmeters: DiscoveryV2.GetAutocompletionParams,
  searchClient: SearchClient,
  overrideAutocompletions?: DiscoveryV2.Completions
): [AutocompleteStore, AutocompleteActions] => {
  const {
    state: autocompletionsState,
    parameters: currentAutocompleteParameters,
    setParameters: setAutocompleteParameters,
    setData: setAutocompletions,
    setFetchToken
  } = useDataApi<DiscoveryV2.GetAutocompletionParams, DiscoveryV2.Completions>(
    autocompleteParmeters,
    searchClient.getAutocompletion,
    searchClient,
    overrideAutocompletions
  );

  const fetchAutocompletions: AutocompleteActions['fetchAutocompletions'] = useCallback(
    autocompleteParameters => {
      setAutocompleteParameters(autocompleteParameters);
      setFetchToken({ trigger: true });
    },
    [setAutocompleteParameters, setFetchToken]
  );

  return [
    {
      ...autocompletionsState,
      parameters: currentAutocompleteParameters
    },
    {
      setAutocompletions,
      fetchAutocompletions
    }
  ];
};
