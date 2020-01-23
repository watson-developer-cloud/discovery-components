import React, { useContext } from 'react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { NoAuthAuthenticator } from 'ibm-watson/auth';
import './app.scss';
import { settings } from 'carbon-components';
import { Button } from 'carbon-components-react';
import Close from '@carbon/icons-react/lib/close/16';

import {
  DiscoverySearch,
  SearchContext,
  SearchApi,
  SearchInput,
  SearchResults,
  SearchFacets,
  ResultsPagination,
  DocumentPreview
} from '@ibm-watson/discovery-react-components';

const App = () => {
  // TODO: this is a dummy client to route requests to the server since CP4D doesn't support CORS
  const authenticator = new NoAuthAuthenticator();
  const searchClient = new DiscoveryV2({
    url: `${window.location.href}api`,
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
  return (
    <main>
      <div className="root">
        <div className={`${settings.prefix}--search-app__nav-toolbar`}>
          <p>Discovery React Components Example Search App</p>
        </div>
        <div className={`${settings.prefix}--search-app__top-container ${settings.prefix}--grid`}>
          <div className={`${settings.prefix}--row`}>
            <div className={`${settings.prefix}--col-md-8`}>
              <SearchInput
                light={true}
                small={false}
                completionsCount={7}
                spellingSuggestions={true}
              />
            </div>
          </div>
          <div
            className={`${settings.prefix}--row ${settings.prefix}--search-app__facets-and-results`}
          >
            <div
              className={`${settings.prefix}--col-md-2 ${settings.prefix}--search-app__facets-and-results__facets`}
            >
              <SearchFacets />
            </div>
            <div
              className={`${settings.prefix}--col-md-6 ${settings.prefix}--search-app__facets-and-results__results`}
            >
              <SearchResults />
            </div>
          </div>
        </div>
        <div className={`${settings.prefix}-grid ${settings.prefix}--search-app__pagination`}>
          <div className={`${settings.prefix}--row`}>
            <div className={`${settings.prefix}--col-md-8`}>
              <ResultsPagination />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PreviewPage() {
  const { setSelectedResult } = useContext(SearchApi);

  function back(evt) {
    evt.preventDefault();
    setSelectedResult({ document: null });
  }

  return (
    <div className={`${settings.prefix}--search-app--preview-page`}>
      <div className={`${settings.prefix}--search-app__nav-toolbar`}>
        <p>Document</p>
        <Button
          hasIconOnly={true}
          iconDescription="Back to search"
          onClick={back}
          renderIcon={Close}
          tooltipPosition="left"
          tooltipAlignment="start"
        />
      </div>
      <DocumentPreview />
    </div>
  );
}

export default App;
