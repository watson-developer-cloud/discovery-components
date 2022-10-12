import { mockHomePage } from '../../support/utils';

describe('Spelling', () => {
  beforeEach(() => {
    mockHomePage();

    // Set up/override routes & fixtures that are specific to this file
    cy.intercept('POST', '**/query?version=2019-01-01', {
      fixture: 'query/misspelledQuery.json'
    }).as('postQueryMisspelled');
  });

  describe('When entering a misspelled query', () => {
    beforeEach(() => {
      cy.findByPlaceholderText('Search').type('waston{enter}');
      cy.wait('@postQueryMisspelled');
    });

    it('a spelling correction is displayed in SearchResults', () => {
      cy.get('button').contains('watson').should('exist');
    });

    describe('and clicking on the suggested query term', () => {
      beforeEach(() => {
        cy.intercept('POST', '**/query?version=2019-01-01', {
          fixture: 'query/correctedQuery.json'
        }).as('postQueryCorrected');
        cy.contains('No results found').click(); // Makes this test less flakey, but there's a race condition in SearchInput we should solve at some point
        cy.get('button').contains('watson').click();
        cy.wait('@postQueryCorrected').as('correctedQueryObject');
      });

      it('updates the query with the suggested term', () => {
        cy.get('.bx--search-input').should('have.value', 'watson');
      });

      it('submits the correct query', () => {
        cy.get('@correctedQueryObject')
          .its('request.body.natural_language_query')
          .should('eq', 'watson');
      });
    });
  });
});
