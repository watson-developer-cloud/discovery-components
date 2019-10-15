import React from 'react';
import { SearchContext, SearchContextIFC } from '../components/DiscoverySearch/DiscoverySearch';

export function wrapWithContext(
  children: React.ReactElement,
  contextOverride: Partial<SearchContextIFC>
): React.ReactElement {
  const context: SearchContextIFC = {
    onSearch: (): Promise<void> => Promise.resolve(),
    onRefinementsMount: (): Promise<void> => Promise.resolve(),
    onUpdateAggregationQuery: (): Promise<void> => Promise.resolve(),
    onUpdateNaturalLanguageQuery: (): Promise<void> => Promise.resolve(),
    onUpdateFilter: (): Promise<void> => Promise.resolve(),
    onUpdateResultsPagination: (): Promise<void> => Promise.resolve(),
    onUpdateSelectedCollections: (): Promise<void> => Promise.resolve(),
    onSelectResult: (): Promise<void> => Promise.resolve(),
    aggregationResults: {},
    searchResults: {},
    searchParameters: {
      project_id: ''
    },
    selectedResult: {},
    completionResults: {},
    collectionsResults: {}
  };
  return (
    <SearchContext.Provider value={Object.assign(context, contextOverride)}>
      {children}
    </SearchContext.Provider>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const browserWindow: any = global; // Using this variable will allow us to access the browser window in our tests
