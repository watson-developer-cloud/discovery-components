describe('Dynamic Facets', () => {
  beforeEach(() => {
    //TODO: we'll need to make sure we can pass in an override for the query, as we want specific facets to come back
    // Sets up and handles the collections, component settings, and initial query requests that run on page-load
    cy.server();
    cy.fixture('collections/collections.json').as('collectionsJSON');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');

    //override the standard query with one that has more facets
    cy.fixture('query/facetsQuery.json').as('facetsQueryJSON');
    cy.route('POST', '**/query?version=2019-01-01', '@facetsQueryJSON').as('postQueryFacets');

    //override the component settings to return specific dynamic facets
    cy.fixture('component_settings/multiSelectFacetsComponentSettings.json').as(
      'multiSelectComponentSettingsJSON'
    );
    cy.route(
      'GET',
      '**/component_settings?version=2019-01-01',
      '@multiSelectComponentSettingsJSON'
    ).as('getComponentSettings');

    cy.visit('/');
    cy.wait(['@getCollections', '@getComponentSettings', '@postQueryFacets']);

    // Set up/override routes & fixtures that are specific to this file
    cy.fixture('query/facetsQuerySingleRefinement.json').as('facetsQuerySingleRefinementJSON');
    cy.fixture('query/facetsQueryMultiRefinement.json').as('facetsQueryMultiRefinementJSON');
    cy.fixture('query/facetsQueryDynamicAndNonDynamic.json').as(
      'facetsQueryDynamicAndNonDynamicJSON'
    );
  });

  describe('When a query is made, and dynamic facets are returned', () => {
    beforeEach(() => {
      cy.findByLabelText('Search').type('restaurants{enter}');
      cy.wait('@postQueryFacets');
      cy.get('.bx--search-facet')
        .filter(':contains("Dynamic Facets")')
        .as('dynamicFacets');
      // set aliases for the dynamic facet filters
      cy.get('@dynamicFacets')
        .contains('regression')
        .as('regressionFilter');
      cy.get('@dynamicFacets')
        .contains('classification')
        .as('classificationFilter');
      cy.get('@dynamicFacets')
        .contains('naive bayes')
        .as('naiveBayesFilter');
    });

    it('available dynamic facets are listed on the side', () => {
      cy.get('@regressionFilter').should('exist');
      cy.get('@classificationFilter').should('exist');
      cy.get('@naiveBayesFilter').should('exist');
    });

    it('dynamic facets are displayed as checkboxes', () => {
      cy.get('@dynamicFacets')
        .find('.bx--checkbox')
        .should('have.length', 3);
    });

    describe('and a dynamic facet filter is selected', () => {
      beforeEach(() => {
        cy.route('POST', '**/query?version=2019-01-01', '@facetsQuerySingleRefinementJSON').as(
          'postQueryFacetsSingle'
        );
        cy.get('label')
          .contains('regression')
          .click();
        cy.wait('@postQueryFacetsSingle').as('singleRefinementQueryObject');
      });

      it('makes a query for the right facets', () => {
        cy.get('@singleRefinementQueryObject')
          .its('requestBody.filter')
          .should('eq', '"regression"');
      });

      it('the bubble next to dynamic facets says 1', () => {
        cy.get('.bx--list-box__selection')
          .contains('1')
          .should('exist');
      });

      describe('and a different filter is selected from dynamic facets', () => {
        beforeEach(() => {
          cy.route('POST', '**/query?version=2019-01-01', '@facetsQueryMultiRefinementJSON').as(
            'postQueryMultiRefinement'
          );
          cy.get('label')
            .contains('classification')
            .click();
          cy.wait('@postQueryMultiRefinement').as('multiRefinementQueryObject');
        });

        it('makes a query for both filters', () => {
          cy.get('@multiRefinementQueryObject')
            .its('requestBody.filter')
            .should('eq', '"regression","classification"');
        });

        it('the bubble next to dynamic facets says 2', () => {
          cy.get('.bx--list-box__selection')
            .contains('2')
            .should('exist');
        });
      });

      describe('and the "Clear all" button is clicked', () => {
        beforeEach(() => {
          cy.route('POST', '**/query?version=2019-01-01', '@facetsQueryJSON').as('postQueryFacets');
          cy.get('button')
            .contains('Clear all')
            .click();
          cy.wait('@postQueryFacets').as('clearedFacetsQueryObject');
        });

        it('makes a query without any selected facets', () => {
          cy.get('@clearedFacetsQueryObject')
            .its('requestBody.filter')
            .should('eq', '');
        });

        it('the "Clear all" button disappears', () => {
          cy.findByText('Dynamic Facets').should('exist'); // make sure this test doesn't pass when the page is blank
          cy.get('button')
            .contains('Clear all')
            .should('not.exist');
        });
      });

      describe('and the same facet checkbox is clicked', () => {
        beforeEach(() => {
          cy.route('POST', '**/query?version=2019-01-01', '@facetsQueryJSON').as('postQueryFacets');
          cy.get('label')
            .contains('regression')
            .click();
          cy.wait('@postQueryFacets').as('clearedFacetsQueryObject');
        });

        it('makes a query without any selected facets', () => {
          cy.get('@clearedFacetsQueryObject')
            .its('requestBody.filter')
            .should('eq', '');
        });
      });

      describe('and a different filter is clicked from a different facet', () => {
        beforeEach(() => {
          cy.route(
            'POST',
            '**/query?version=2019-01-01',
            '@facetsQueryDynamicAndNonDynamicJSON'
          ).as('postQueryDynamicAndNonDynamic');
          cy.get('label')
            .contains('Hancock, MN')
            .click();
          cy.wait('@postQueryDynamicAndNonDynamic').as('dynamicAndNonDynamicQueryObject');
        });

        it('makes a query with both filters', () => {
          cy.get('@dynamicAndNonDynamicQueryObject')
            .its('requestBody.filter')
            .should('eq', 'location:"Hancock, MN","regression"');
        });
      });
    });
  });
});
