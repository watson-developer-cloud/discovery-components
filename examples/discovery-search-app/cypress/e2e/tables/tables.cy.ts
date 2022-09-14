import { mockHomePage } from '../../support/utils';

describe('Table Results', () => {
  beforeEach(() => {
    mockHomePage();

    // Set up/override routes & fixtures that are specific to this file
    cy.intercept('POST', '**/query?version=2019-01-01', { fixture: 'query/tableResults.json' }).as(
      'postQueryTables'
    );
  });

  describe('When entering a query whose results contain tables', () => {
    it('should show expected results and toggle tables on/off', () => {
      cy.get('.bx--search-input').type('learning{enter}');
      cy.get('.bx--search-result').should('have.length', 3);

      // SearchResults displays ONLY the first table of the results that have tables
      cy.get('table').contains('You should be able to see this table').should('exist');
      cy.get('table').contains('This table has an accompanying passage').should('exist');
      cy.get('.bx--search-result')
        .contains('You should NOT be able to see this table')
        .should('not.exist');
      cy.get('.bx--search-result').contains('Supervised Learning').should('not.exist');

      // each result with a table has a link to view table in document
      cy.findAllByTestId('search-result-element-preview-button')
        .filter(':contains("View table in document")')
        .should('have.length', 2);

      // when clicking on "View table in document" for a result
      cy.findAllByTestId('search-result-element-preview-button')
        .contains('View table in document')
        .click();

      // navigates to Document Preview for that document
      cy.get('p').contains('Document').should('exist');
      cy.get('.bx--document-preview').should('exist');
      cy.get('.bx--document-preview')
        .contains(
          "This result has multiple passages, so we'll display them in the order that they're returned."
        )
        .should('exist');
      cy.get('.bx--document-preview')
        .contains('We can display multiple passages that are returned for each document.')
        .should('exist');

      // clicking on the close preview button
      cy.findByLabelText('Back to search').click();

      // closes the document preview
      cy.get('.bx--document-preview').should('not.exist');
      cy.get('.bx--search-result').should('have.length', 3);

      // "show table results only" is toggled on
      cy.get('label').contains('Show table results only').click();

      // only the results with tables are displayed and the toggle is marked on
      cy.get('.bx--search-result').should('have.length', 5);
      cy.get('.bx--search-result').filter(':contains(table)').should('have.length', 5);
      cy.get('.bx--search-result')
        .contains(
          "This result has multiple passages, so we'll display them in the order that they're returned."
        )
        .should('not.exist');
      cy.get('table').contains('This table has an accompanying passage').should('exist');
      cy.get('.bx--search-result')
        .contains('This result has passages and a table.')
        .should('not.exist');
      cy.get('.bx--search-result')
        .contains('We can display multiple passages that are returned for each document.')
        .should('not.exist');
      cy.get('table')
        .contains('You should ONLY see this table when tables-only results are shown.')
        .should('exist');
      cy.get('.bx--toggle-input__label').contains('On').should('exist');

      // "show table results only" is toggled back off
      cy.get('label').contains('Show table results only').click();

      // all of the passage results are displayed
      cy.get('.bx--search-result').should('have.length', 3);
      cy.get('.bx--search-result').filter(':contains(table)').should('have.length', 2);
      cy.get('.bx--search-result')
        .contains(
          "This result has multiple passages, so we'll display them in the order that they're returned."
        )
        .should('exist');
      cy.get('.bx--search-result')
        .contains('We can display multiple passages that are returned for each document.')
        .should('exist');
    });
  });
});
