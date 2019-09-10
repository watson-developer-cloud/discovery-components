describe('basic test', () => {
  beforeEach(() => {
    cy.server();
    cy.fixture('basic/query.json').as('queryJSON');
    cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQuery');
  });

  it('loads page', () => {
    cy.visit('/');
    cy.get('input').type('abil');
    cy.wait('@postQuery')
      .its('requestBody.natural_language_query')
      .should('eq', 'abil');
  });
});
