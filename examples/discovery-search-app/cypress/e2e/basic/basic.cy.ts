import { mockHomePage, visitHomePage } from '../../support/utils';

describe('Basic search', () => {
  beforeEach(() => {
    mockHomePage();

    // set an alias for the search input, since we're using that a lot
    cy.findByPlaceholderText('Search').as('searchInput');
  });

  // Rendering initial page
  describe('When the example app loads', () => {
    it('should be able to query and show expected results', () => {
      // SearchInput should appear with magnifying glass icon
      cy.get('@searchInput').should('be.visible');
      cy.get('svg.bx--search-magnifier-icon').should('be.visible');

      // Querying with results
      cy.get('@searchInput').type('abil{enter}');
      cy.get('@postQuery').its('request.body.natural_language_query').should('eq', 'abil');

      // query should have values set for `return` param
      cy.get('@postQuery')
        .its('request.body.return')
        .should('include.members', [
          'document_id',
          'document_passages',
          'extracted_metadata.filename',
          'extracted_metadata.title',
          'highlight',
          'result_metadata',
          'text',
          'title'
        ]);

      // SearchResults displays a list of results
      cy.get('.bx--search-result').should('have.length', 3);

      // each result displays the file title and collection id of its source document
      cy.get('.bx--search-result').filter(':contains("COLLECTION_ID_0")').should('have.length', 2);
      cy.get('.bx--search-result').filter(':contains("COLLECTION_ID_1")').should('have.length', 1);
      cy.get('.bx--search-result').contains('file 1 title').should('exist');
      cy.get('.bx--search-result').contains('file 2 title').should('exist');
      cy.get('.bx--search-result').contains('file 3 title').should('exist');
    });
  });

  describe('When clicking to view document', () => {
    it('should open document preview', () => {
      cy.intercept('POST', '**/query?version=2019-01-01', {
        fixture: 'query/correctedQuery.json'
      }).as('postQueryCorrected');
      cy.get('@searchInput').type('Watson{enter}');

      cy.get('button[data-testid="search-result-element-preview-button"]')
        .contains('View passage in document')
        .click();

      cy.get('.bx--search-app--preview-page').should('be.visible');

      // When showing document preview, verify that another request is sent
      cy.get('@postQueryCorrected')
        .its('request.body.filter')
        .should('eq', 'document_id:e69fd25f-5cbf-4f53-bef3-67834ac1965b');
      cy.get('@postQueryCorrected').its('request.body.return').should('be.empty');
    });
  });

  // Querying without results
  describe('When entering a query with no results', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/query?version=2019-01-01', { fixture: 'query/noResults.json' }).as(
        'postQueryNoResults'
      );
      cy.get('@searchInput').type('abil{enter}');
      cy.wait('@postQueryNoResults');
    });

    it('SearchResults displays "no results found" message', () => {
      cy.get('.bx--search-results').should('contain', 'No results found');
    });
  });
});

describe('Basic search errors', () => {
  beforeEach(() => {
    // Sets up and handles the collections, component settings, and initial query requests that run on page-load
    cy.intercept('GET', '**/collections?version=2019-01-01', {
      fixture: 'collections/collections'
    }).as('getCollections');
    cy.intercept('GET', '**/component_settings?version=2019-01-01', {
      fixture: 'component_settings/componentSettings'
    }).as('getComponentSettings');
  });

  describe('When a user search returns an error', () => {
    it('SearchResults displays error message', () => {
      // query req on initial load
      cy.intercept('POST', '**/query?version=2019-01-01', { fixture: 'query/query' }).as(
        'postQuery'
      );

      visitHomePage(['@getCollections', '@getComponentSettings']);

      cy.findByPlaceholderText('Search').as('searchInput');

      // user search request
      cy.intercept('POST', '**/query?version=2019-01-01', {
        fixture: 'query/error500.json',
        statusCode: 500
      }).as('postQueryError');
      cy.get('@searchInput').type('abil{enter}');
      cy.wait('@postQueryError');

      cy.findByText('An error occurred during search.').should('exist');
    });
  });
});
