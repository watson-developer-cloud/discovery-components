import React from 'react';
import DiscoveryV1 from 'ibm-watson/discovery/v1';

import { DiscoverySearch, SearchInput } from '@disco-widgets/react-components';

const App = () => {
  const searchClient = new DiscoveryV1({
    url: 'http://localhost:4000/api',
    username: 'foo',
    password: 'bar',
    version: '2019-01-01'
  });
  return (
    <DiscoverySearch
      searchClient={searchClient}
      collectionId={'3bbf3413-e6ee-a939-0000-016cc02a54c5'}
    >
      <SearchInput />
    </DiscoverySearch>
  );
};
export default App;
