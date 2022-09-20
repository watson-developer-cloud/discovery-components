import { mockHomePage } from '../../support/utils';

describe('Single-Select Facets', () => {
  beforeEach(() => {
    mockHomePage({
      component_settings: 'component_settings/singleSelectFacetsComponentSettings.json',
      query: 'query/facetsQuery.json'
    });
  });

  describe('When a query is made, and facets are returned', () => {
    beforeEach(() => {
      cy.get('.bx--search-input').type('restaurants{enter}');
      cy.wait('@postQuery');
      cy.get('.bx--search-facet').filter(':contains("City")').as('cityFacet');
      cy.get('.bx--search-facet').filter(':contains("Cuisine")').as('cuisineFacet');
      cy.get('.bx--search-facet').filter(':contains("Price Range")').as('priceFacet');
    });

    it('shows available facets listed on the side', () => {
      cy.get('.bx--search-facet').as('allFacets').should('have.length', 4);
      cy.get('@cityFacet').should('exist');
      cy.get('@cuisineFacet').should('exist');
      cy.get('@priceFacet').should('exist');

      // facets should be radio buttons
      cy.get('@cityFacet').find('.bx--radio-button').should('have.length', 5);
      cy.get('@cuisineFacet').find('.bx--radio-button').should('have.length', 5);
      cy.get('@priceFacet').find('.bx--radio-button').should('have.length', 3);
    });

    describe('and a facet filter is selected', () => {
      beforeEach(() => {
        cy.intercept('POST', '**/query?version=2019-01-01', {
          fixture: 'query/facetsQueryAmes.json'
        }).as('postQueryFacetsAmes');
        cy.get('label').contains('Ames, IA').click();
        cy.wait('@postQueryFacetsAmes').as('amesFilterQueryObject');
      });

      it('makes a query for the right facets', () => {
        cy.get('@amesFilterQueryObject')
          .its('request.body.filter')
          .should('eq', 'location::"Ames, IA"');
      });

      describe('and a different filter is selected from the same facet', () => {
        beforeEach(() => {
          cy.intercept('POST', '**/query?version=2019-01-01', {
            fixture: 'query/facetsQueryHancock.json'
          }).as('postQueryFacetsHancock');
          cy.get('label').contains('Hancock, MN').click();
          cy.wait('@postQueryFacetsHancock').as('hancockFilterQueryObject');
        });

        it('makes a query for only the new facet', () => {
          cy.get('@hancockFilterQueryObject')
            .its('request.body.filter')
            .should('eq', 'location::"Hancock, MN"');
        });
      });

      describe('and the "Clear all" button is clicked', () => {
        beforeEach(() => {
          cy.intercept('POST', '**/query?version=2019-01-01', {
            fixture: 'query/facetsQuery.json'
          }).as('postQueryFacets');
          cy.get('button').contains('Clear all').click();
          cy.wait('@postQueryFacets').as('clearedFacetsQueryObject');
        });

        it('makes a query without any selected facets and "Clear all" button disappears', () => {
          cy.get('@clearedFacetsQueryObject').its('request.body.filter').should('eq', '');
          cy.get('button').contains('Clear all').should('not.exist');
        });
      });

      describe('and the same facet radio button is clicked', () => {
        beforeEach(() => {
          cy.intercept('POST', '**/query?version=2019-01-01', {
            fixture: 'query/facetsQuery.json'
          }).as('postQueryFacets');
          cy.get('label').contains('Ames, IA').click();
          cy.wait('@postQueryFacets').as('clearedFacetsQueryObject');
        });

        it('makes a query without any selected facets', () => {
          cy.get('@clearedFacetsQueryObject').its('request.body.filter').should('eq', '');
        });
      });

      describe('and a different filter is clicked from a different facet', () => {
        beforeEach(() => {
          cy.intercept('POST', '**/query?version=2019-01-01', {
            fixture: 'query/facetsQueryAmesLowPrice.json'
          }).as('postQueryFacetsCombined');
          cy.get('@priceFacet').contains('Low').click();
          cy.wait('@postQueryFacetsCombined').as('combinedFacetQueryObject');
        });

        it('makes a query with both filters', () => {
          cy.get('@combinedFacetQueryObject')
            .its('request.body.filter')
            .should('eq', 'location::"Ames, IA",price::"Low"');
        });
      });
    });

    describe('and "Show more" is clicked', () => {
      beforeEach(() => {
        cy.get('@cuisineFacet').contains('Show more').click();
      });

      it('has the list of facets expand', () => {
        cy.get('@cuisineFacet').find('input').should('have.length', 9);
      });

      describe('and "Show less" is clicked', () => {
        beforeEach(() => {
          cy.get('@cuisineFacet').contains('Show less').click();
        });

        it('has the list of facets collapse', () => {
          cy.get('@cuisineFacet').find('input').should('have.length', 5);
        });
      });
    });
  });
});
