import { mockHomePage } from '../../support/utils';

describe('Basic search', () => {
  beforeEach(() => {
    mockHomePage();

    // Set up/override routes & fixtures that are specific to this file
    cy.fixture('query/noResults.json').as('noResultsJSON');

    // set an alias for the search input, since we're using that a lot
    cy.findByPlaceholderText('Search').as('searchInput');
  });

  // Rendering initial page
  describe('When the example app loads', () => {
    it('SearchInput should appear', () => {
      cy.get('@searchInput').should('be.visible');
    });

    it('SearchInput has magnifying glass icon', () => {
      cy.get('svg.bx--search-magnifier').should('be.visible');
    });
  });

  // Querying with results
  describe('When entering a query with results', () => {
    beforeEach(() => {
      cy.get('@searchInput').type('abil{enter}');
      cy.wait('@postQuery').as('queryObject');
    });

    it('makes the appropriate query request', () => {
      cy.get('@queryObject')
        //@ts-ignore TODO: we'll need to handle typings for `cy.its` at some point, but for now, we'll ignore the error on the parameter string
        .its('requestBody.natural_language_query')
        .should('eq', 'abil');
    });

    it('SearchResults displays a list of results', () => {
      cy.get('.bx--search-result').should('have.length', 3);
    });

    it('each result displays the file title and collection id of its source document', () => {
      cy.get('.bx--search-result')
        .filter(':contains("COLLECTION_ID_0")')
        .should('have.length', 2);
      cy.get('.bx--search-result')
        .filter(':contains("COLLECTION_ID_1")')
        .should('have.length', 1);
      cy.get('.bx--search-result')
        .contains('file 1 title')
        .should('exist');
      cy.get('.bx--search-result')
        .contains('file 2 title')
        .should('exist');
      cy.get('.bx--search-result')
        .contains('file 3 title')
        .should('exist');
    });
  });

  // Querying without results
  describe('When entering a query with no results', () => {
    beforeEach(() => {
      cy.route('POST', '**/query?version=2019-01-01', '@noResultsJSON').as('postQueryNoResults');
      cy.get('@searchInput').type('abil{enter}');
      cy.wait('@postQueryNoResults');
    });

    it('SearchResults displays "no results found" message', () => {
      cy.get('.bx--search-results').should('contain', 'There were no results found');
    });
  });
});
