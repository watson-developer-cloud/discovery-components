import { mockHomePage } from '../../support/utils';

describe('Multi-Select Facets', () => {
  beforeEach(() => {
    mockHomePage({
      component_settings: 'component_settings/multiSelectFacetsComponentSettings.json',
      query: 'query/facetsQuery.json'
    });

    // Set up/override routes & fixtures that are specific to this file
    cy.fixture('query/facetsQuery.json').as('facetsQueryJSON');
    cy.fixture('query/facetsQueryAmes.json').as('facetsQueryAmesJSON');
    cy.fixture('query/facetsQueryAmesLowPrice.json').as('facetsQueryAmesLowPriceJSON');
    cy.fixture('query/facetsQueryAmesOrPittsburgh.json').as('facetsQueryAmesOrPittsburghJSON');
  });

  describe('When a query is made, and facets are returned', () => {
    beforeEach(() => {
      cy.get('.bx--search-input').type('restaurants{enter}');
      cy.wait('@postQuery');
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

    it('shows available facets listed on the side', () => {
      cy.get('.bx--search-facet')
        .as('allFacets')
        .should('have.length', 4);
      cy.get('@cityFacet').should('exist');
      cy.get('@cuisineFacet').should('exist');
      cy.get('@priceFacet').should('exist');
    });

    it('has facets displayed as checkboxes', () => {
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

      it('changes the bubble next to that facet to say 1', () => {
        cy.get('.bx--list-box__selection')
          .contains('1')
          .should('exist');
      });

      describe('and a different filter is selected from the same facet', () => {
        beforeEach(() => {
          cy.route('POST', '**/query?version=2019-01-01', '@facetsQueryAmesOrPittsburghJSON').as(
            'postQueryFacetsAmesOrPittsburgh'
          );
          cy.get('label')
            .contains('Pittsburgh, PA')
            .click();
          cy.wait('@postQueryFacetsAmesOrPittsburgh').as('multiFilterQueryObject');
        });

        it('makes a query for both filters in the facet', () => {
          cy.get('@multiFilterQueryObject')
            .its('requestBody.filter')
            .should('eq', 'location:"Pittsburgh, PA"|"Ames, IA"');
        });

        it('changes the bubble next to that facet to say 2', () => {
          cy.get('.bx--list-box__selection')
            .contains('2')
            .should('exist');
        });
      });

      describe('and a result is previewed', () => {
        it('preserves facet selection after document preview', () => {
          cy.findAllByTestId('search-result-element-preview-button')
            .first()
            .click();
          cy.get('.bx--btn__icon').click();
          cy.get("input[id='checkbox-location-Ames,_IA']").should('have.attr', 'checked');
          cy.get('.bx--list-box__selection')
            .contains('1')
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

        it('has the "Clear all" button disappear', () => {
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

          it('has the filters from only that facet clear', () => {
            cy.get('@amesFilterQueryObject')
              .its('requestBody.filter')
              .should('eq', 'location:"Ames, IA"');
          });
        });
      });
    });
  });
});
