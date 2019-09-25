import React from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import './app.scss';
import refinementsQueryResponse from './fixtures/refinementsQueryResponse';
import { document as pdfDocument } from './fixtures/intro_to_watson_discovery';

import {
  DiscoverySearch,
  SearchInput,
  SearchResults,
  SearchRefinements,
  ResultsPagination,
  RichPreview
} from '@disco-widgets/react-components';

const App = () => {
  // TODO: this is a dummy client to route requests to the server since CP4D doesn't support CORS
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
      <SearchInput
        light={false}
        small={false}
        placeHolderText={'This is some placeholder text...'}
        labelText={'This is some label text...'}
      />
      <SearchResults />
      <SearchRefinements queryResponse={refinementsQueryResponse} />
      <ResultsPagination />
      <RichPreview file={atob(pdfDocument)} />
    </DiscoverySearch>
  );
};
export default App;
