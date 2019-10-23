import React, { useContext, useState } from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import './app.scss';

import {
  DiscoverySearch,
  SearchContext,
  SearchInput,
  SearchResults,
  SearchRefinements,
  ResultsPagination,
  DocumentPreview
} from '@disco-widgets/react-components';

const App = () => {
  // TODO: this is a dummy client to route requests to the server since CP4D doesn't support CORS
  const searchClient = new DiscoveryV1({
    url: 'http://localhost:4000/api',
    version: '2019-01-01',
    use_unauthenticated: true
  });

  return (
    <DiscoverySearch searchClient={searchClient} projectId={process.env.REACT_APP_PROJECT_ID}>
      <AppView />
    </DiscoverySearch>
  );
};

function AppView() {
  const { selectedResult } = useContext(SearchContext);
  return !selectedResult ? <SearchPage /> : <PreviewPage />;
}

function SearchPage() {
  const [configuration] = useState([
    {
      field: 'enriched_text.entities.text',
      count: 10
    },
    {
      field: 'enriched_title.entities.text',
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
      <SearchResults bodyField={'highlight.text[0]'} />
      <SearchRefinements showCollections={true} configuration={configuration} />
      <ResultsPagination />
    </>
  );
}

function PreviewPage() {
  const { onSelectResult } = useContext(SearchContext);

  function back(evt) {
    evt.preventDefault();
    onSelectResult(null);
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
