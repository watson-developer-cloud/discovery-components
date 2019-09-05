it('loads page', () => {
  cy.visit('/');
  cy.get('input').type('abil');
  cy.contains('ability');
})