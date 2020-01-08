import { mockDefaultHomePage } from '../../support/utils';

describe('Spelling', () => {
  beforeEach(() => {
    mockDefaultHomePage();

    // Set up/override routes & fixtures that are specific to this file
    cy.fixture('query/misspelledQuery.json').as('misspelledQueryJSON');
    cy.fixture('query/correctedQuery.json').as('correctedQueryJSON');
    cy.route('POST', '**/query?version=2019-01-01', '@misspelledQueryJSON').as(
      'postQueryMisspelled'
    );
  });

  describe('When entering a misspelled query', () => {
    beforeEach(() => {
      cy.get('.bx--search-input').type('waston{enter}');
      cy.wait('@postQueryMisspelled');
    });

    it('a spelling correction is displayed in SearchResults', () => {
      cy.get('button')
        .contains('watson')
        .should('exist');
    });

    describe('and clicking on the suggested query term', () => {
      beforeEach(() => {
        cy.route('POST', '**/query?version=2019-01-01', '@correctedQueryJSON').as(
          'postQueryCorrected'
        );
        cy.get('button')
          .contains('watson')
          .click();
        cy.wait('@postQueryCorrected').as('correctedQueryObject');
      });

      it('updates the query with the suggested term', () => {
        cy.get('.bx--search-input').should('have.value', 'watson');
      });

      it('submits the correct query', () => {
        cy.get('@correctedQueryObject')
          // @ts-ignore
          .its('requestBody.natural_language_query')
          .should('eq', 'watson');
      });
    });
  });
});
