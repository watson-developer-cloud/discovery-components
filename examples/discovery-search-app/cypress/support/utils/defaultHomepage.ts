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

  // start the cypress server
  cy.server();

  // Sets up and handles the collections, component settings, and initial query requests that run on page-load
  cy.fixture(fixturePaths.collections).as('collectionsJSON');
  cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
  cy.fixture(fixturePaths.component_settings).as('componentSettingsJSON');
  cy.route('GET', '**/component_settings?version=2019-01-01', '@componentSettingsJSON').as(
    'getComponentSettings'
  );
  cy.fixture(fixturePaths.query).as('queryJSON');
  cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQuery');

  // visit the home page and wait for page load requests
  visitHomePage(['@getCollections', '@getComponentSettings']);
}

/**
 * visit home page, and wait for the requests made on page load to resolve
 * @param pageLoadRequests array of route aliases to wait for before continuing the tests
 */
export function visitHomePage(pageLoadRequests: string[] = []) {
  cy.visit('/');
  cy.wait(pageLoadRequests);
}
