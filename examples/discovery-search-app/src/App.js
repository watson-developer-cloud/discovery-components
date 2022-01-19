import React, { useContext, useState, useEffect, useMemo } from 'react';
import cx from 'classnames';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { NoAuthAuthenticator } from 'ibm-watson/auth';
import { settings } from 'carbon-components';
import { Button, Tabs, Tab, Loading } from 'carbon-components-react';
import Close from '@carbon/icons-react/lib/close/16';
import './app.scss';
import { ExampleDocumentProvider } from './ExampleDocumentProvider';

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
  // TODO: this is a dummy client to route requests to the server since CP4D doesn't support CORS
  const authenticator = useMemo(() => new NoAuthAuthenticator(), []);
  const searchClient = useMemo(
    () =>
      new DiscoveryV2({
        url: `${window.location.href}api`,
        version: '2019-01-01',
        authenticator
      }),
    [authenticator]
  );
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
  return !document ? <SearchPage /> : <PreviewPage document={document} />;
}

function SearchPage() {
  const {
    searchResponseStore: { isError }
  } = useContext(SearchContext);

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
      </div>
    </main>
  );
}

function PreviewPage({ document }) {
  const { setSelectedResult } = useContext(SearchApi);

  const tabs = [
    {
      name: 'Document',
      Component: DocumentPreview
    }
  ];

  if (canRenderCIDocument(document)) {
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
                <Component document={document} />
              </div>
            )}
          />
        ))}
      </Tabs>
    </div>
  );
}

export default App;
