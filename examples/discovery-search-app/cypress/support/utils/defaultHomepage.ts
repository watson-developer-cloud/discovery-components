//TODO: We'll probably want to create more util files to make this functionality more intuitive and modular.

interface HomePageFixturePaths {
  collections?: string;
  component_settings?: string;
  query?: string;
}

const DEFAULT_FIXTURE_PATHS = {
  collections: 'collections/collections.json',
  component_settings: 'component_settings/componentSettings.json',
  query: 'query/query.json'
};

/**
 * Set up initial mocks for-, and navigate to the home page, then wait for mocked requests to resolve
 * @param overrideFixturePaths override default mocks for the home page
 */
export function mockHomePage(overrideFixturePaths: HomePageFixturePaths = {}): void {
  const fixturePaths = Object.assign({}, DEFAULT_FIXTURE_PATHS, overrideFixturePaths);

  // Default to returning 404 error for any unhandle requests.
  // Subsequent `cy.intercept` calls can override this catch-all.
  cy.intercept(
    {
      headers: {
        accept: 'application/json'
      }
    },
    {
      statusCode: 404
    }
  );

  // Sets up and handles the collections, component settings, and initial query requests that run on page-load
  cy.intercept('GET', '**/collections?version=2019-01-01', {
    fixture: fixturePaths.collections
  }).as('getCollections');
  cy.intercept('GET', '**/component_settings?version=2019-01-01', {
    fixture: fixturePaths.component_settings
  }).as('getComponentSettings');
  cy.intercept('POST', '**/query?version=2019-01-01', { fixture: fixturePaths.query }).as(
    'postQuery'
  );

  // visit the home page and wait for page load requests
  visitHomePage(['@getCollections', '@getComponentSettings', '@postQuery']);
}

/**
 * visit home page, and wait for the requests made on page load to resolve
 * @param pageLoadRequests array of route aliases to wait for before continuing the tests
 */
export function visitHomePage(pageLoadRequests: string[] = []) {
  cy.visit('/');
  cy.wait(pageLoadRequests);
}
