describe('Single-Select Facets', () => {
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
    cy.fixture('component_settings/singleSelectFacetsComponentSettings.json').as(
      'singleSelectComponentSettingsJSON'
    );
    cy.route(
      'GET',
      '**/component_settings?version=2019-01-01',
      '@singleSelectComponentSettingsJSON'
    ).as('getComponentSettings');

    cy.visit('/');
    cy.wait(['@getCollections', '@getComponentSettings', '@postQueryFacets']);

    // Set up/override routes & fixtures that are specific to this file
    cy.fixture('query/facetsQueryAmes.json').as('facetsQueryAmesJSON');
    cy.fixture('query/facetsQueryAmesLowPrice.json').as('facetsQueryAmesLowPriceJSON');
    cy.fixture('query/facetsQueryHancock.json').as('facetsQueryHancockJSON');
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

    it('facets are displayed as radio buttons', () => {
      cy.get('@cityFacet')
        .find('.bx--radio-button')
        .should('have.length', 5);
      cy.get('@cuisineFacet')
        .find('.bx--radio-button')
        .should('have.length', 5);
      cy.get('@priceFacet')
        .find('.bx--radio-button')
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

      describe('and a different filter is selected from the same facet', () => {
        beforeEach(() => {
          cy.route('POST', '**/query?version=2019-01-01', '@facetsQueryHancockJSON').as(
            'postQueryFacetsHancock'
          );
          cy.get('label')
            .contains('Hancock, MN')
            .click();
          cy.wait('@postQueryFacetsHancock').as('hancockFilterQueryObject');
        });

        it('makes a query for only the new facet', () => {
          cy.get('@hancockFilterQueryObject')
            .its('requestBody.filter')
            .should('eq', 'location:"Hancock, MN"');
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

      describe('and the same facet radio button is clicked', () => {
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
      });
    });

    describe('and "Show more" is clicked', () => {
      beforeEach(() => {
        cy.get('@cuisineFacet')
          .contains('Show more')
          .click();
      });

      it('the list of facets is expanded', () => {
        cy.get('@cuisineFacet')
          .find('input')
          .should('have.length', 9);
      });

      describe('and "Show less" is clicked', () => {
        beforeEach(() => {
          cy.get('@cuisineFacet')
            .contains('Show less')
            .click();
        });

        it('the list of facets is collapsed', () => {
          cy.get('@cuisineFacet')
            .find('input')
            .should('have.length', 5);
        });
      });
    });
  });
});
