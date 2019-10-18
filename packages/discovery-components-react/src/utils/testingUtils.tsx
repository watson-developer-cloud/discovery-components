import React from 'react';
import {
  SearchContext,
  SearchContextIFC,
  searchContextDefaults
} from '../components/DiscoverySearch/DiscoverySearch';

export function wrapWithContext(
  children: React.ReactElement,
  contextOverride: Partial<SearchContextIFC>
): React.ReactElement {
  return (
    <SearchContext.Provider value={Object.assign(searchContextDefaults, contextOverride)}>
      {children}
    </SearchContext.Provider>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const browserWindow: any = global; // Using this variable will allow us to access the browser window in our tests
