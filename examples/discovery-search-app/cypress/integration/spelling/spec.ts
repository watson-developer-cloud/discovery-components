describe('Spelling', () => {
  beforeEach(() => {
    cy.server();
    cy.fixture('collections/collections.json').as('collectionsJSON');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
    cy.fixture('query/misspelledQuery.json').as('misspelledQueryJSON');
    cy.fixture('query/correctedQuery.json').as('correctedQueryJSON');
    cy.fixture('component_settings/componentSettings.json').as('componentSettingsJSON');
    cy.route('GET', '**/component_settings?version=2019-01-01', '@componentSettingsJSON').as(
      'componentSettings'
    );
    cy.route('POST', '**/query?version=2019-01-01', '@misspelledQueryJSON').as('misspelledQuery');
    cy.visit('/');
  });

  describe('When entering a misspelled query', () => {
    beforeEach(() => {
      cy.get('.bx--search-input').type('waston{enter}');
      cy.wait('@misspelledQuery');
    });

    it('a spelling correction is displayed in SearchResults', () => {
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
        cy.wait('@correctedQuery').as('correctedQueryObject');
      });

      it('updates the query with the suggested term', () => {
        cy.get('.bx--search-input').should('have.value', 'watson');
      });

      it('submits the correct query', () => {
        cy.get('@correctedQueryObject')
          .its('requestBody.natural_language_query')
          .should('eq', 'watson');
      });
    });
  });
});
