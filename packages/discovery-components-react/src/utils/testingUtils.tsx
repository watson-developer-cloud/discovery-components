import React from 'react';
import { SearchContext, SearchContextIFC } from '../components/DiscoverySearch/DiscoverySearch';

export function wrapWithContext(
  children: React.ReactElement,
  contextOverride: Partial<SearchContextIFC>
): React.ReactElement {
  const context: SearchContextIFC = {
    onSearch: (): Promise<void> => Promise.resolve(),
    onUpdateNaturalLanguageQuery: (): Promise<void> => Promise.resolve(),
    onUpdateResultsPagination: (): Promise<void> => Promise.resolve(),
    searchResults: {},
    searchParameters: {
      environment_id: '',
      collection_id: ''
    }
  };
  return (
    <SearchContext.Provider value={Object.assign(context, contextOverride)}>
      {children}
    </SearchContext.Provider>
  );
}
