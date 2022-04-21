import React, { useContext, useState, useEffect, useMemo } from 'react';
import cx from 'classnames';
import urljoin from 'proper-url-join';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { NoAuthAuthenticator } from 'ibm-watson/auth';
import { settings } from 'carbon-components';
import { Button, Tabs, Tab, Loading } from 'carbon-components-react';
import Close from '@carbon/icons-react/lib/close/16';
import { ExampleDocumentProvider } from './ExampleDocumentProvider';
import './app.scss';

import {
  DiscoverySearch,
  SearchContext,
  SearchApi,
  SearchInput,
  SearchResults,
  SearchFacets,
  ResultsPagination,
  DocumentPreview,
  CIDocument,
  canRenderCIDocument
} from '@ibm-watson/discovery-react-components';

const App = () => {
  const searchClient = useMemo(() => {
    // Tell SDK to send requests to our server's `/api` endpoint, where
    // we will add authentication header.
    const serviceUrl = urljoin(window.location.href, 'api');
    // Client-side authentication is not supported. See `setupProxy.js` for
    // the server-side code to add authentication header.
    const authenticator = new NoAuthAuthenticator();

    return new DiscoveryV2({
      serviceUrl,
      version: '2019-01-01',
      authenticator
    });
  }, []);
  const [projectId, setProjectId] = useState(process.env.REACT_APP_PROJECT_ID);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  if (process.env.REACT_APP_CYPRESS_MODE && !projectId) {
    console.warn('Running in feature test mode, setting REACT_APP_PROJECT_ID to "cypress"');
    setProjectId('cypress');
  }

  useEffect(() => {
    async function fetchProjects() {
      try {
        const {
          result: { projects }
        } = await searchClient.listProjects();
        const projectId =
          projects.find(project => project.name === 'Sample Project')?.project_id ||
          projects[0]?.project_id;
        if (projectId) {
          setProjectId(projectId);
        } else {
          console.error(
            'No projects found. Please ensure your Discovery instance has at least 1 project'
          );
          setIsError(true);
        }
      } catch (e) {
        console.error('Error fetching projects', e);
        setIsError(true);
      }
      setIsLoading(false);
    }

    if (!projectId && !isLoading && !isError) {
      console.warn(
        'REACT_APP_PROJECT_ID was not set, attempting to use sample project id or first available project...'
      );
      setIsLoading(true);
      fetchProjects();
    }
  }, [projectId, isLoading, searchClient, isError]);

  return isLoading || !projectId ? (
    <Loading />
  ) : isError ? (
    <div>Unable to load Discovery projects. Please check your console for more details.</div>
  ) : (
    <DiscoverySearch
      searchClient={searchClient}
      projectId={projectId}
      documentProvider={new ExampleDocumentProvider()}
    >
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
  const {
    searchResponseStore: { isError }
  } = useContext(SearchContext);

  return (
    <main className="root">
      <div className={`${settings.prefix}--search-app__nav-toolbar`}>
        <p>Discovery React Components Example Search App</p>
      </div>
      <div className={`${settings.prefix}--search-app__top-container ${settings.prefix}--grid`}>
        <div className={`${settings.prefix}--row`}>
          <div className={`${settings.prefix}--col-md-8`}>
            {/* Carbon v11: change size value to "md" */}
            <SearchInput light={true} size="lg" completionsCount={7} spellingSuggestions={true} />
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
            {!isError ? <SearchResults /> : <p>An error occurred during search.</p>}
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
    </main>
  );
}

function PreviewPage() {
  const {
    selectedResult: { document: selectedDocument },
    searchResponseStore: { data: searchResponse },
    fetchDocumentsResponseStore: { data: fetchDocumentResponse, isLoading }
  } = useContext(SearchContext);
  const { fetchDocuments, setSelectedResult } = useContext(SearchApi);
  const [hasFetchedDocument, setHasFetchedDocument] = useState(false);

  const {
    document_id,
    result_metadata: { collection_id }
  } = selectedDocument;

  // Fetch full document
  useEffect(() => {
    if (!hasFetchedDocument) {
      // Note: Document IDs are unique within each collection, but not within project. Therefore,
      // to avoid returning the wrong document, we must also pass the collection ID.
      fetchDocuments(`document_id:${document_id}`, [collection_id], searchResponse);
      setHasFetchedDocument(true);
    }
  }, [document_id, collection_id, searchResponse, fetchDocuments, hasFetchedDocument]);

  const fullDocument = fetchDocumentResponse?.results?.[0];

  const tabs = [
    {
      name: 'Document',
      Component: DocumentPreview
    }
  ];

  if (canRenderCIDocument(fullDocument)) {
    tabs.push({ name: 'Content Intelligence', Component: CIDocument });
  }

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
      {isLoading ? (
        <Loading className={`${settings.prefix}--search-app__loading`} />
      ) : (
        <Tabs
          className={`${settings.prefix}--search-app__tabs`}
          selected={0}
          aria-label="Document details tabs"
        >
          {tabs.map(({ name, Component, ...restProps }) => (
            <Tab
              key={name}
              label={name}
              {...restProps}
              renderContent={({ selected }) => (
                <div
                  className={cx({
                    [`${settings.prefix}--search-app__tabs--hidden`]: !selected,
                    [`${settings.prefix}--search-app__content`]: true
                  })}
                >
                  <Component document={fullDocument} />
                </div>
              )}
            />
          ))}
        </Tabs>
      )}
    </div>
  );
}

export default App;
