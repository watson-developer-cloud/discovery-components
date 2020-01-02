describe('Basic search', () => {
  beforeEach(() => {
    cy.server();
    cy.fixture('collections/collections.json').as('collectionsJSON');
    cy.fixture('query/query.json').as('queryJSON');
    cy.fixture('query/noResults.json').as('noResultsJSON');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
    cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQuery');
    cy.visit('/');
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
      cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQuery');
      cy.get('.bx--search-input').type('abil{enter}');
    });

    it('makes the appropriate query request', () => {
      cy.wait('@postQuery')
        .its('requestBody.count')
        .should('eq', 0);
      cy.wait('@postQuery')
        .its('requestBody.natural_language_query')
        .should('eq', 'abil');
    });

    it('SearchResults displays a list of results', () => {
      cy.get('.bx--search-result').should('have.length', 3);
    });
  });

  // Querying without results
  describe('When entering a query with no results', () => {
    beforeEach(() => {
      cy.route('POST', '**/query?version=2019-01-01', '@noResultsJSON').as('noResultsQuery');
      cy.get('.bx--search-input').type('abil{enter}');
    });

    it('SearchResults displays "no results found" message', () => {
      cy.get('.bx--search-results').should('contain', 'There were no results found');
    });
  });
});
