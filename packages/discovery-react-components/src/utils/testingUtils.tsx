import React from 'react';
import {
  SearchApi,
  SearchContext,
  SearchContextIFC,
  SearchApiIFC,
  searchApiDefaults,
  searchContextDefaults
} from 'components/DiscoverySearch/DiscoverySearch';

export function wrapWithContext(
  children: React.ReactElement,
  apiOverride: Partial<SearchApiIFC>,
  contextOverride: Partial<SearchContextIFC>
): React.ReactElement {
  return (
    <SearchApi.Provider value={Object.assign(searchApiDefaults, apiOverride)}>
      <SearchContext.Provider value={Object.assign(searchContextDefaults, contextOverride)}>
        {children}
      </SearchContext.Provider>
    </SearchApi.Provider>
  );
}

export function createDummyResponse(result: any) {
  return {
    result,
    status: 200,
    statusText: 'OK',
    headers: {}
  };
}

export function createDummyResponsePromise<T>(result: T) {
  return Promise.resolve(createDummyResponse(result));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const browserWindow: any = global; // Using this variable will allow us to access the browser window in our tests
