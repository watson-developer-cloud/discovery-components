describe('Table Results', () => {
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
    cy.fixture('query/tableResults.json').as('tableResultsJSON');
    cy.route('POST', '**/query?version=2019-01-01', '@tableResultsJSON').as('postQueryTables');
  });

  describe('When entering a query whose results contain tables', () => {
    beforeEach(() => {
      cy.get('.bx--search-input').type('learning{enter}');
    });

    it('SearchResults displays ONLY the first table of the results that have tables', () => {
      cy.get('.bx--search-result')
        .contains('You should be able to see this table')
        .should('exist');
      cy.get('.bx--search-result')
        .contains('You should NOT be able to see this table')
        .should('not.exist');
      cy.get('.bx--search-result')
        .contains('Supervised Learning')
        .should('exist');
    });

    it('each result with a table has a link to view table in document', () => {
      cy.get('button[data-testid="search-result-element-preview-button"]')
        .filter(':contains("View table in document")')
        .should('have.length', 3);
    });

    describe('and clicking on "View table in document" for a result', () => {
      beforeEach(() => {
        cy.get('button[data-testid="search-result-element-preview-button"]')
          .contains('View table in document')
          .click();
      });

      it('navigates to Document Preview for that document', () => {
        cy.get('p')
          .contains('Document')
          .should('exist');
        cy.get('.bx--document-preview').should('exist');
        cy.get('.bx--document-preview')
          .contains('Supervised Learning')
          .should('exist');
      });

      describe('and clicking on the close preview button', () => {
        beforeEach(() => {
          cy.get('svg[aria-label="Back to search"]').click();
        });

        it('closes the document preview', () => {
          cy.get('.bx--document-preview').should('not.exist');
          cy.get('.bx--search-result').should('have.length', 4);
        });
      });
    });

    describe('and "show table results only" is toggled on', () => {
      beforeEach(() => {
        cy.get('label')
          .contains('Show table results only')
          .click();
      });

      it('only the results with tables are displayed', () => {
        cy.get('.bx--search-result').should('have.length', 4);
        cy.get('.bx--search-result')
          .filter(':contains(table)')
          .should('have.length', 4);
        cy.get('.bx--search-result')
          .contains(
            'This result multiple passages, but you should only be able to see the first one.'
          )
          .should('not.exist');
        cy.get('table')
          .contains('This table has an accompanying passage')
          .should('exist');
        cy.get('.bx--search-result')
          .contains('This result has passages and a table.')
          .should('not.exist');
      });

      it('the "show table results only" toggle is marked "On"', () => {
        cy.get('.bx--toggle-input__label')
          .contains('On')
          .should('exist');
      });

      describe('and "show table results only" is toggled back off', () => {
        beforeEach(() => {
          cy.get('label')
            .contains('Show table results only')
            .click();
        });

        it('all of the results are displayed', () => {
          cy.get('.bx--search-result').should('have.length', 4);
          cy.get('.bx--search-result')
            .filter(':contains(table)')
            .should('have.length', 3);
          cy.get('.bx--search-result')
            .contains(
              'This result multiple passages, but you should only be able to see the first one.'
            )
            .should('exist');
        });
      });
    });
  });
});
