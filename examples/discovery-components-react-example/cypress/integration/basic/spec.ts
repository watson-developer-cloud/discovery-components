describe('basic test', () => {
  beforeEach(() => {
    cy.server();
    cy.fixture('basic/query.json').as('queryJSON');
    cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQuery');
    cy.fixture('basic/collections.json').as('collectionsJSON');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
    cy.visit('/');
  });
  describe('When entering a query', () => {
    beforeEach(() => {
      cy.get('.bx--search-input').type('abil{enter}');
    });

    it('makes the appropriate query request', () => {
      cy.wait('@postQuery')
        .its('requestBody.aggregation')
        .should(
          'eq',
          '[term(enriched_text.entities.text,count:10),term(enriched_title.entities.text,count:10)]'
        );

      cy.wait('@postQuery')
        .its('requestBody.natural_language_query')
        .should('eq', 'abil');
    });
  });
  describe('search refinements filters test', () => {
    it('clears previous filters when a new natural language query is made', () => {
      cy.get('#checkbox-subject-Animals').click({ force: true });
      cy.wait('@postQuery')
        .its('requestBody.aggregation')
        .should(
          'eq',
          '[term(enriched_text.entities.text,count:10),term(enriched_title.entities.text,count:10)]'
        );

      cy.wait('@postQuery')
        .its('requestBody.filter')
        .should('eq', 'subject:Animals');

      cy.get('.bx--search-input').type('abil{enter}');

      cy.wait('@postQuery')
        .its('requestBody.filter')
        .should('eq', '');
    });
  });
});
