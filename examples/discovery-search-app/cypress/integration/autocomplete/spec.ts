describe('Autocomplete', () => {
  beforeEach(() => {
    cy.server();
    cy.visit('/');
  });

  // Autocomplete tests
  describe('When typing an incomplete word in the input', () => {
    const expectedAutocompletions = ['have', 'helm', 'how', 'hadoop', 'hive', 'hostname', 'high'];

    beforeEach(() => {
      cy.fixture('autocomplete/autocompletions.json').as('autocompletionsJSON');
      cy.route(
        'GET',
        '**/autocompletion?version=2019-01-01&prefix=h&count=7',
        '@autocompletionsJSON'
      ).as('getAutocompletions');
      cy.get('.bx--search-input').type('h');
    });

    it('displays a dropdown of autocomplete suggestions', () => {
      cy.wait('@getAutocompletions');

      cy.get('.bx--search-autocompletion__term').each((autocompletionTerm, i) => {
        expect(autocompletionTerm).to.contain('h');
        expect(autocompletionTerm).to.contain(expectedAutocompletions[i].slice(1));
      });
    });

    describe('and clicking on an autocomplete option', () => {
      beforeEach(() => {
        cy.get('.bx--search-autocompletion__term')
          .first()
          .click();
      });

      it('updates the query with the correct completion', () => {
        cy.get('.bx--search-input').should('have.value', `${expectedAutocompletions[0]} `);
      });
    });

    describe('and clicking away from the SearchInput', () => {
      beforeEach(() => {
        cy.get('.bx--search-input').blur();
      });

      it('autocomplete dropdown disappears', () => {
        cy.get('.bx--search-autocompletion__term').should('not.exist');
      });
    });
  });

  describe('When typing " " into the search input', () => {
    beforeEach(() => {
      cy.fixture('basic/query.json').as('queryJSON');
      cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQuery');
      cy.get('.bx--search-input').type(' ');
    });

    it('does not display the autocomplete dropdown', () => {
      cy.get('.bx--search-autocompletion__term').should('not.exist');
    });

    describe('and hit enter', () => {
      beforeEach(() => {
        cy.get('.bx--search-input').type('{enter}');
      });

      it('performs a query with the correct term', () => {
        cy.wait('@postQuery')
          .its('requestBody.natural_language_query')
          .should('be.eq', ' ');
      });
    });
  });
});
