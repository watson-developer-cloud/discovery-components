import React from 'react';
import { SearchContext, SearchContextIFC } from '../components/DiscoverySearch/DiscoverySearch';

export function wrapWithContext(
  children: React.ReactElement,
  contextOverride: Partial<SearchContextIFC>
): React.ReactElement {
  const context: SearchContextIFC = {
    onSearch: (): Promise<void> => Promise.resolve(),
    onLoadAggregationResults: (): Promise<void> => Promise.resolve(),
    onUpdateAggregationQuery: (): Promise<void> => Promise.resolve(),
    onUpdateNaturalLanguageQuery: (): Promise<void> => Promise.resolve(),
    onUpdateResultsPagination: (): Promise<void> => Promise.resolve(),
    onSelectResult: (): Promise<void> => Promise.resolve(),
    aggregationResults: {},
    searchResults: {},
    searchParameters: {
      project_id: ''
    },
    selectedResult: {}
  };
  return (
    <SearchContext.Provider value={Object.assign(context, contextOverride)}>
      {children}
    </SearchContext.Provider>
  );
}
