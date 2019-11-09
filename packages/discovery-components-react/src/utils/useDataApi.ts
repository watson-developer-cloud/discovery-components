import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import { SearchClient } from '../components/DiscoverySearch/types';

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
        isError: false
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};

/**
 * interface to explain the return value of useDataApi
 */
interface UseDataApiReturn {
  /**
   * similar to useReducer, state is where the data and loading/error information live
   */
  state: any;
  /**
   * parameters are sent to the API for the corresponding SDK method
   */
  parameters: any;
  /**
   * a method used to update the parameters that are sent to the API
   */
  setParameters: (initialData: any) => void;
  /**
   * a method that can be used to override the data attribute directly
   */
  setData: React.Dispatch<React.SetStateAction<any>>;
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
}

/**
 * custom hook that fetches and stores data while handling complex condidions such as:
 * - request cancellation
 * - latest data fetching
 * - error handling
 * @param initialParameters - initial parameters used with this API
 * @param initialData - initial response data for this API
 * @param searchClientMethod - api method reference on the searchClient
 * @param searchClient - the client used to do data fetching
 */
const useDataApi = (
  initialParameters: any,
  initialData: any,
  searchClientMethod: (params: any, callback?: any) => void | Promise<any>,
  searchClient: Pick<
    DiscoveryV2,
    'query' | 'getAutocompletion' | 'listCollections' | 'getComponentSettings'
  >
): UseDataApiReturn => {
  // useRef stores state without rerenders
  // token to pass by reference instead of by value to keep track of cancellation state on unmount
  const cancelToken = useRef(false);
  // counter to keep track of the most recent API request
  const requestIdRef = useRef(0);
  // token used to invoke the API call and optionally return the response data to the callback
  const [fetchToken, setFetchToken] = useState<FetchToken>({ trigger: false, callback: undefined });
  const [parameters, setParameters] = useState(initialParameters);
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });
  const setData = (data: any): void => {
    dispatch({ type: 'FETCH_SUCCESS', payload: data });
  };
  const fetchData = useCallback(
    async (parameters, requestId, callback): Promise<void> => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { result } = await searchClientMethod.call(searchClient, parameters);
        // before storing the data, make sure the component hasn't been unmounted
        // and make sure this request is the most recent one (discard old requests)
        if (!cancelToken.current && requestId === requestIdRef.current) {
          dispatch({ type: 'FETCH_SUCCESS', payload: result });
          if (callback) {
            callback(result);
          }
        }
      } catch (error) {
        if (!cancelToken.current) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
      }
    },
    [searchClient, searchClientMethod]
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
      fetchData(parameters, requestIdRef.current, fetchToken.callback);
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
}

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
  setSearchParameters: React.Dispatch<React.SetStateAction<DiscoveryV2.QueryParams>>;
  /**
   * method to override the current search response
   */
  setSearchResponse: (overrideSearchResponse: DiscoveryV2.QueryResponse | null) => void;
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
  searchParameters: DiscoveryV2.QueryParams,
  overrideSearchResults: DiscoveryV2.QueryResponse | null,
  searchClient: SearchClient
): [SearchResponseStore, SearchResponseStoreActions] => {
  const {
    state: searchState,
    parameters: currentSearchParameters,
    setParameters: setSearchParameters,
    setData: setSearchResponse,
    setFetchToken
  } = useDataApi(searchParameters, overrideSearchResults, searchClient.query, searchClient);
  return [
    {
      ...searchState,
      parameters: currentSearchParameters
    },
    {
      setSearchParameters,
      setSearchResponse,
      // callback can be passed in here to return back data to the invoker of the search
      // in the specific case here, we need to set our aggregation store after performing a search
      performSearch: (callback?: (result: any) => void): void =>
        setFetchToken({ trigger: true, callback })
    }
  ];
};
