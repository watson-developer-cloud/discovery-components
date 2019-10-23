import React from 'react';
import {
  SearchApi,
  SearchContext,
  SearchContextIFC,
  SearchApiIFC,
  searchApiDefaults,
  searchContextDefaults
} from '../components/DiscoverySearch/DiscoverySearch';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const browserWindow: any = global; // Using this variable will allow us to access the browser window in our tests
