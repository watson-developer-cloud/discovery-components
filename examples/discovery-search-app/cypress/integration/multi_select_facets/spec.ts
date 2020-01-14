describe('Multi-Select Facets', () => {
  beforeEach(() => {
    //TODO: we'll need to make sure we can pass in an override for the query, as we want specific facets to come back
    // Sets up and handles the collections, component settings, and initial query requests that run on page-load
    cy.server();
    cy.fixture('collections/collections.json').as('collectionsJSON');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');

    //override the standard query with one that has more facets
    cy.fixture('query/facetsQuery.json').as('facetsQueryJSON');
    cy.route('POST', '**/query?version=2019-01-01', '@facetsQueryJSON').as('postQueryFacets');

    //override the component settings to make facets single-select
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
    cy.fixture('query/facetsQueryAmes.json').as('facetsQueryAmesJSON');
    cy.fixture('query/facetsQueryAmesLowPrice.json').as('facetsQueryAmesLowPriceJSON');
    cy.fixture('query/facetsQueryAmesAndPittsburgh.json').as('facetsQueryAmesAndPittsburghJSON');
  });

  describe('When a query is made, and facets are returned', () => {
    beforeEach(() => {
      cy.get('.bx--search-input').type('restaurants{enter}');
      cy.wait('@postQueryFacets');
      cy.get('.bx--search-facet')
        .filter(':contains("City")')
        .as('cityFacet');
      cy.get('.bx--search-facet')
        .filter(':contains("Cuisine")')
        .as('cuisineFacet');
      cy.get('.bx--search-facet')
        .filter(':contains("Price Range")')
        .as('priceFacet');
    });

    it('available facets are listed on the side', () => {
      cy.get('.bx--search-facet')
        .as('allFacets')
        .should('have.length', 4);
      cy.get('@cityFacet').should('exist');
      cy.get('@cuisineFacet').should('exist');
      cy.get('@priceFacet').should('exist');
    });

    it('facets are displayed as checkboxes', () => {
      cy.get('@cityFacet')
        .find('.bx--checkbox')
        .should('have.length', 5);
      cy.get('@cuisineFacet')
        .find('.bx--checkbox')
        .should('have.length', 5);
      cy.get('@priceFacet')
        .find('.bx--checkbox')
        .should('have.length', 3);
    });

    describe('and a facet filter is selected', () => {
      beforeEach(() => {
        cy.route('POST', '**/query?version=2019-01-01', '@facetsQueryAmesJSON').as(
          'postQueryFacetsAmes'
        );
        cy.get('label')
          .contains('Ames, IA')
          .click();
        cy.wait('@postQueryFacetsAmes').as('amesFilterQueryObject');
      });

      it('makes a query for the right facets', () => {
        cy.get('@amesFilterQueryObject')
          .its('requestBody.filter')
          .should('eq', 'location:"Ames, IA"');
      });

      it('the bubble next to that facet says 1', () => {
        cy.get('.bx--list-box__selection')
          .contains('1')
          .should('exist');
      });

      describe('and a different filter is selected from the same facet', () => {
        beforeEach(() => {
          cy.route('POST', '**/query?version=2019-01-01', '@facetsQueryAmesAndPittsburghJSON').as(
            'postQueryFacetsAmesAndPittsburgh'
          );
          cy.get('label')
            .contains('Pittsburgh, PA')
            .click();
          cy.wait('@postQueryFacetsAmesAndPittsburgh').as('multiFilterQueryObject');
        });

        it('makes a query for both filters in the facet', () => {
          cy.get('@multiFilterQueryObject')
            .its('requestBody.filter')
            .should('eq', 'location:"Pittsburgh, PA"|"Ames, IA"');
        });

        it('the bubble next to that facet says 2', () => {
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
          cy.get('button')
            .contains('Clear all')
            .should('not.exist');
        });
      });

      describe('and the same facet checkbox is clicked', () => {
        beforeEach(() => {
          cy.route('POST', '**/query?version=2019-01-01', '@facetsQueryJSON').as('postQueryFacets');
          cy.get('label')
            .contains('Ames, IA')
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
          cy.route('POST', '**/query?version=2019-01-01', '@facetsQueryAmesLowPriceJSON').as(
            'postQueryFacetsCombined'
          );
          cy.get('@priceFacet')
            .contains('Low')
            .click();
          cy.wait('@postQueryFacetsCombined').as('combinedFacetQueryObject');
        });

        it('makes a query with both filters', () => {
          cy.get('@combinedFacetQueryObject')
            .its('requestBody.filter')
            .should('eq', 'location:"Ames, IA",price:"Low"');
        });

        describe('and the selected filters bubble from only one of the facets is clicked', () => {
          beforeEach(() => {
            cy.route('POST', '**/query?version=2019-01-01', '@facetsQueryAmesJSON').as(
              'postQueryFacetsAmes'
            );
            cy.get('@priceFacet')
              .find('.bx--list-box__selection')
              .click();
            cy.wait('@postQueryFacetsAmes').as('amesFilterQueryObject');
          });

          it('the filters from only that facet are cleared', () => {
            cy.get('@amesFilterQueryObject')
              .its('requestBody.filter')
              .should('eq', 'location:"Ames, IA"');
          });
        });
      });
    });
  });
});
