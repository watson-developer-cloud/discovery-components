import React, { useContext, useState } from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import { NoAuthAuthenticator } from '@disco-widgets/ibm-watson/auth';
import './app.scss';

import {
  DiscoverySearch,
  SearchContext,
  SearchApi,
  SearchInput,
  SearchResults,
  SearchRefinements,
  ResultsPagination,
  DocumentPreview
} from '@disco-widgets/react-components';

const App = () => {
  // TODO: this is a dummy client to route requests to the server since CP4D doesn't support CORS
  const authenticator = new NoAuthAuthenticator();
  const searchClient = new DiscoveryV1({
    url: 'http://localhost:4000/api',
    version: '2019-01-01',
    authenticator
  });

  return (
    <DiscoverySearch searchClient={searchClient} projectId={process.env.REACT_APP_PROJECT_ID}>
      <AppView />
    </DiscoverySearch>
  );
};

function AppView() {
  const {
    selectedResult: { document }
  } = useContext(SearchContext);
  return !document ? <SearchPage /> : <PreviewPage />;
}

function SearchPage() {
  const [configuration] = useState([
    {
      field: 'extracted_metadata.title',
      count: 10
    },
    {
      field: 'extracted_metadata.file_type',
      count: 10
    }
  ]);
  return (
    <>
      <SearchInput
        light={false}
        small={false}
        placeHolderText={'This is some placeholder text...'}
        labelText={'This is some label text...'}
        completionsCount={7}
        spellingSuggestions={true}
      />
      <SearchResults bodyField={'text'} />
      <SearchRefinements showCollections={true} configuration={configuration} />
      <ResultsPagination />
    </>
  );
}

function PreviewPage() {
  const { setSelectedResult } = useContext(SearchApi);

  function back(evt) {
    evt.preventDefault();
    setSelectedResult({ document: null });
  }

  return (
    <div className="preview-page">
      <div className="nav-toolbar">
        <a href="/" onClick={back}>
          {'< Back to Search'}
        </a>
      </div>
      <DocumentPreview />
    </div>
  );
}

export default App;
