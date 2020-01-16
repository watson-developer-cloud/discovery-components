describe('Spelling', () => {
  beforeEach(() => {
    // Sets up and handles the collections, component settings, and initial query requests that run on page-load
    cy.server();
    cy.fixture('collections/collections.json').as('collectionsJSON');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
    cy.fixture('component_settings/componentSettings.json').as('componentSettingsJSON');
    cy.route('GET', '**/component_settings?version=2019-01-01', '@componentSettingsJSON').as(
      'getComponentSettings'
    );
    cy.fixture('query/query.json').as('queryJSON');
    cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQuery');
    cy.visit('/');
    cy.wait(['@getCollections', '@getComponentSettings', '@postQuery']);

    // Set up/override routes & fixtures that are specific to this file
    cy.fixture('query/misspelledQuery.json').as('misspelledQueryJSON');
    cy.fixture('query/correctedQuery.json').as('correctedQueryJSON');
    cy.route('POST', '**/query?version=2019-01-01', '@misspelledQueryJSON').as(
      'postQueryMisspelled'
    );
  });

  describe('When entering a misspelled query', () => {
    beforeEach(() => {
      cy.findByLabelText('Search').type('waston{enter}');
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
          .its('requestBody.natural_language_query')
          .should('eq', 'watson');
      });
    });
  });
});
