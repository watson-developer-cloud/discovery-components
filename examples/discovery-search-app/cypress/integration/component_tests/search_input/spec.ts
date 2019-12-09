describe('SearchInput component', () => {
  beforeEach(() => {
    cy.server();
    cy.visit('/');
  });

  describe('When the SearchInput loads', () => {
    it('has placeholder text "Search"', () => {
      cy.get('.bx--search-input').should('have.attr', 'placeholder', 'Search');
    });

    it('has magnifying glass icon', () => {
      cy.get('.bx--search-magnifier').should('be.visible');
    });
  });

  // Basic query tests
  describe('When entering a query', () => {
    beforeEach(() => {
      cy.fixture('components/search_input/query.json').as('queryJSON');
      cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQuery');
      cy.get('.bx--search-input').type('abil{enter}');
    });

    it('makes the appropriate query request', () => {
      // cy.wait('@postQuery')
      //   .its('requestBody.count')
      //   .should('eq', 0);
      cy.wait('@postQuery')
        .its('requestBody.natural_language_query')
        .should('eq', 'abil');
    });
  });

  // Spelling suggestion tests
  // TODO: maybe this section should get moved to the SearchResults tests?
  describe('When entering a misspelled query', () => {
    beforeEach(() => {
      cy.fixture('components/search_input/misspelledQuery.json').as('misspelledQueryJSON');
      cy.route('POST', '**/query?version=2019-01-01', '@misspelledQueryJSON').as('misspelledQuery');
      cy.get('.bx--search-input').type('waston{enter}');
    });

    describe('and clicking on the suggested query term', () => {
      beforeEach(() => {
        cy.wait('@misspelledQuery');
        cy.fixture('components/search_input/blah.json').as('correctedQueryJSON');
        cy.route('POST', '**/query?version=2019-01-01', '@correctedQueryJSON').as('correctedQuery');
        cy.get('button')
          .contains('watson')
          .click();
        cy.wait('@correctedQuery');
      });

      it('updates the query with the suggested term', () => {
        cy.get('.bx--search-input').should('have.value', 'watson');
      });

      it('submits the correct query', () => {
        cy.wait('@correctedQuery')
          .its('requestBody.natural_language_query')
          .should('eq', 'watson');
      });
    });
  });

  // Autocomplete tests
  describe('When typing an incomplete word in the input', () => {
    const expectedAutocompletions = ['have', 'helm', 'how', 'hadoop', 'hive', 'hostname', 'high'];

    beforeEach(() => {
      cy.fixture('components/search_input/autocompletions.json').as('autocompletionsJSON');
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
      cy.fixture('components/search_input/query.json').as('queryJSON');
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

      it('performs a query without a search term', () => {
        cy.wait('@postQuery')
          .its('requestBody.natural_language_query')
          .should('be.undefined');
      });
    });
  });
});
