describe('Passage Results', () => {
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
    cy.fixture('query/passageResults.json').as('passageResultsJSON');
    cy.route('POST', '**/query?version=2019-01-01', '@passageResultsJSON').as('postQueryPassages');
  });

  describe('When entering a query whose results contain passages', () => {
    beforeEach(() => {
      cy.get('.bx--search-input').type('ibm{enter}');
    });

    it('SearchResults displays ONLY the first passage text of the results that have passages', () => {
      cy.get('.bx--search-result__content-wrapper__body')
        .contains(
          'This result multiple passages, but you should only be able to see the first one.'
        )
        .should('exist');
      cy.get('.bx--search-result__content-wrapper__body')
        .contains('if you can see this passage, something probably borked')
        .should('not.exist');
      cy.get('.bx--search-result__content-wrapper__body')
        .contains('This result only has one passage, and it should be visible')
        .should('exist');
    });

    it('each result with a passage has a link to view passage in document', () => {
      cy.get('button[data-testid="search-result-element-preview-button"]')
        .filter(':contains("View passage in document")')
        .should('have.length', 3);
    });

    it('each result without document passages or tables displays "Excerpt unavailable"', () => {
      cy.get('.bx--search-result__content-wrapper__body')
        .filter(':contains("Excerpt unavailable.")')
        .should('have.length', 1);
    });

    it('each result without document passages or tables has a link to the document', () => {
      cy.get('button[data-testid="search-result-element-preview-button"]')
        .filter(':contains("View document")')
        .should('have.length', 1);
    });

    describe('and clicking on "View passage in document" for a result', () => {
      beforeEach(() => {
        cy.get('button[data-testid="search-result-element-preview-button"]')
          .contains('View passage in document')
          .click();
      });

      it('navigates to Document Preview for that document', () => {
        cy.get('p')
          .contains('Document')
          .should('exist');
        cy.get('.bx--document-preview').should('exist');
        cy.get('.bx--document-preview')
          .contains(
            'This is a document.\nThis result multiple passages, but you should only be able to see the first one. IBM if you can see this passage, something probably borked'
          )
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

    it('the passage text in each result is dangerously rendered', () => {
      cy.get('.bx--search-result')
        .get('em')
        .contains('IBM')
        .should('exist');
    });

    it('passages and tables can be displayed in the same result', () => {
      cy.get('.bx--search-result')
        .filter(':contains("This result has a passage and a table")')
        .as('combinedResult');
      cy.get('@combinedResult').contains('table');
      cy.get('@combinedResult').contains('View passage in document');
      cy.get('@combinedResult').contains('View table in document');
    });
  });
});
