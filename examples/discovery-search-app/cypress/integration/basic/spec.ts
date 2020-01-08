import { mockDefaultHomePage } from '../../support/utils';

describe('Basic search', () => {
  beforeEach(() => {
    mockDefaultHomePage();

    // Set up/override routes & fixtures that are specific to this file
    cy.fixture('query/noResults.json').as('noResultsJSON');
  });

  // Rendering initial page
  describe('When the example app loads', () => {
    it('SearchInput has placeholder text "Search"', () => {
      cy.get('.bx--search-input').should('have.attr', 'placeholder', 'Search');
    });

    it('SearchInput has magnifying glass icon', () => {
      cy.get('.bx--search-magnifier').should('be.visible');
    });
  });

  // Querying with results
  describe('When entering a query with results', () => {
    beforeEach(() => {
      cy.get('.bx--search-input').type('abil{enter}');
      cy.wait('@postQuery').as('queryObject');
    });

    it('makes the appropriate query request', () => {
      cy.get('@queryObject')
        // @ts-ignore
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
      cy.get('.bx--search-input').type('abil{enter}');
      cy.wait('@postQueryNoResults');
    });

    it('SearchResults displays "no results found" message', () => {
      cy.get('.bx--search-results').should('contain', 'There were no results found');
    });
  });
});
