describe('Spelling', () => {
  beforeEach(() => {
    cy.server({ force404: true });
    cy.fixture('spelling/misspelledQuery.json').as('misspelledQueryJSON');
    cy.fixture('spelling/correctedQuery.json').as('correctedQueryJSON');
    cy.route('POST', '**/query?version=2019-01-01', '@misspelledQueryJSON').as('misspelledQuery');
    cy.visit('/');
  });

  describe('When entering a misspelled query', () => {
    beforeEach(() => {
      cy.get('.bx--search-input').type('waston{enter}');
    });

    it('a spelling correction is displayed in SearchResults', () => {
      cy.wait('@misspelledQuery');
      cy.get('button')
        .contains('watson')
        .should('exist');
    });

    describe('and clicking on the suggested query term', () => {
      beforeEach(() => {
        cy.route('POST', '**/query?version=2019-01-01', '@correctedQueryJSON').as('correctedQuery');
        cy.get('button')
          .contains('watson')
          .click();
      });

      it('updates the query with the suggested term', () => {
        cy.wait('@correctedQuery');
        cy.get('.bx--search-input').should('have.value', 'watson');
      });

      it('submits the correct query', () => {
        cy.wait('@correctedQuery')
          .its('requestBody.natural_language_query')
          .should('eq', 'watson');
      });
    });
  });
});
