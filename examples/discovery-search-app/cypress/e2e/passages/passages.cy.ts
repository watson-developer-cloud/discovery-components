import { mockHomePage } from '../../support/utils';

describe('Passage Results', () => {
  it('test', () => {
    mockHomePage();

    // Set up/override routes & fixtures that are specific to this file
    cy.intercept('POST', '**/query?version=2019-01-01', {
      fixture: 'query/passageResults.json'
    }).as('postQueryPassages');

    // When entering a query whose results contain passages
    cy.get('.bx--search-input').type('ibm{enter}');

    // SearchResults displays all passages of the results that have them
    cy.findByText(
      "This result has multiple passages, so we'll display them in the order that they're returned.",
      { exact: false }
    ).should('be.visible');
    cy.findByText('We can display multiple passages that are returned for each document.').should(
      'be.visible'
    );
    cy.findByText('This result only has one passage, and it should be visible').should(
      'be.visible'
    );

    // each result with a passage has a link to view passage in document
    cy.findAllByTestId('search-result-element-preview-button')
      .filter(':contains("View passage in document")')
      .should('have.length', 4);

    // each result without document passages or tables displays "Excerpt unavailable"
    cy.get('.bx--search-result__content-wrapper__body')
      .filter(':contains("Excerpt unavailable.")')
      .should('have.length', 1);

    // each result without document passages or tables has a link to the document
    cy.findAllByTestId('search-result-element-preview-button')
      .filter(':contains("View document")')
      .should('have.length', 1);

    // and clicking on "View passage in document" for a result
    cy.findAllByTestId('search-result-element-preview-button')
      .contains('View passage in document')
      .click();

    // navigates to Document Preview for that document
    cy.get('p').contains('Document').should('exist');
    cy.get('.bx--document-preview').should('exist');
    cy.get('.bx--document-preview')
      .contains(
        "This result has multiple passages, so we'll display them in the order that they're returned. IBM. We can display multiple passages that are returned for each document."
      )
      .should('exist');

    // and clicking on "CI Document" for a result
    cy.findByLabelText('Back to search').click();
    cy.get('button[data-testid="search-result-element-preview-button"]')
      .contains('View table in document')
      .click();
    cy.findByText('Content Intelligence').click();

    // diplays filters under Attribute
    cy.findByText('Select labels to filter elements').should('exist');
    cy.findByText('Attribute').should('exist');
    cy.findByText('Currency').should('exist');

    // navigate to relations tab and display filters
    cy.findByText('Relations').click({ force: true }); // force button click even though cypress thinks it is covered by iframe
    cy.findByText('Relation').should('exist');
    cy.findByText('Invoice parts').should('exist');

    // and clicking on the close preview button
    cy.findByLabelText('Back to search').click();

    // closes the document preview
    cy.get('.bx--document-preview').should('not.exist');
    cy.get('.bx--search-result').should('have.length', 4);

    // the passage text in each result is dangerously rendered
    cy.get('.bx--search-result').get('em').contains('IBM').should('exist');

    // passages and tables can be displayed in the same result
    cy.get('.bx--search-result')
      .filter(':contains("This result has a passage and a table")')
      .as('combinedResult');
    cy.get('@combinedResult').contains('table');
    cy.get('@combinedResult').contains('View passage in document');
    cy.get('@combinedResult').contains('View table in document');
  });
});
