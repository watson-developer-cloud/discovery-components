//TODO: break down the logic in this funtion so that these defaults can be overwritten. We'll probably want to
// create more util files to make this functionality more intuitive and modular.
export function mockDefaultHomePage() {
  // Sets up and handles the collections, component settings, and initial query requests that run on page-load
  cy.server();
  cy.fixture('collections/collections.json').as('collectionsJSON');
  cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
  cy.fixture('component_settings/componentSettings.json').as('componentSettingsJSON');
  cy.route('GET', '**/component_settings?version=2019-01-01', '@componentSettingsJSON').as(
    'getComponentSettings'
  );
  cy.fixture('query/query.json').as('queryJSON');
  cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQuery');
  cy.visit('/');
  cy.wait(['@getCollections', '@getComponentSettings', '@postQuery']);
}
