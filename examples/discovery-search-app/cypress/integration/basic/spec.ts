describe('basic test', () => {
  beforeEach(() => {
    cy.server({ force404: true });
    cy.fixture('basic/collections.json').as('collectionsJSON');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
    cy.fixture('basic/query.json').as('queryJSON');
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

    // TODO: top entities

    // TODO: collections selector
  });

  // Basic query tests
  describe('When entering a query', () => {
    beforeEach(() => {
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
  });
});
