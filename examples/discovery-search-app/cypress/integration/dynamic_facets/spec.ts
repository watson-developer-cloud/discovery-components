import { mockHomePage } from '../../support/utils';

describe('Dynamic Facets', () => {
  beforeEach(() => {
    mockHomePage({
      component_settings: 'component_settings/multiSelectFacetsComponentSettings.json',
      query: 'query/facetsQuery.json'
    });

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
      cy.wait('@postQuery');
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

    it('shows available dynamic facets listed on the side', () => {
      cy.get('@regressionFilter').should('exist');
      cy.get('@classificationFilter').should('exist');
      cy.get('@naiveBayesFilter').should('exist');
    });

    it('has dynamic facets displayed as checkboxes', () => {
      cy.get('@dynamicFacets')
        .find('.bx--checkbox')
        .should('have.length', 3);
    });

    // TODO: update this test once API supports a result count for dynamic facets
    it('does not show dynamic facet matching result count', () => {
      cy.get('@dynamicFacets')
        .find('.bx--search-facet__facet__option-label')
        .first()
        .should('have.text', 'regression');
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
          //@ts-ignore TODO: we'll need to handle typings for `cy.its` at some point, but for now, we'll ignore the error on the parameter string
          .its('requestBody.filter')
          .should('eq', '"regression"');
      });

      it('shows the bubble next to dynamic facets saying 1', () => {
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
            //@ts-ignore TODO: we'll need to handle typings for `cy.its` at some point, but for now, we'll ignore the error on the parameter string
            .its('requestBody.filter')
            .should('eq', '"regression","classification"');
        });

        it('shows the bubble next to dynamic facets saying 2', () => {
          cy.get('.bx--list-box__selection')
            .contains('2')
            .should('exist');
        });
      });

      describe('and the "Clear all" button is clicked', () => {
        beforeEach(() => {
          cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQueryFacets');
          cy.get('button')
            .contains('Clear all')
            .click();
          cy.wait('@postQueryFacets').as('clearedFacetsQueryObject');
        });

        it('makes a query without any selected facets', () => {
          cy.get('@clearedFacetsQueryObject')
            //@ts-ignore TODO: we'll need to handle typings for `cy.its` at some point, but for now, we'll ignore the error on the parameter string
            .its('requestBody.filter')
            .should('eq', '');
        });

        it('has the "Clear all" button disappear', () => {
          cy.findByText('Dynamic Facets').should('exist'); // make sure this test doesn't pass when the page is blank
          cy.get('button')
            .contains('Clear all')
            .should('not.exist');
        });
      });

      describe('and the same facet checkbox is clicked', () => {
        beforeEach(() => {
          cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQueryFacets');
          cy.get('label')
            .contains('regression')
            .click();
          cy.wait('@postQueryFacets').as('clearedFacetsQueryObject');
        });

        it('makes a query without any selected facets', () => {
          cy.get('@clearedFacetsQueryObject')
            //@ts-ignore TODO: we'll need to handle typings for `cy.its` at some point, but for now, we'll ignore the error on the parameter string
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
            //@ts-ignore TODO: we'll need to handle typings for `cy.its` at some point, but for now, we'll ignore the error on the parameter string
            .its('requestBody.filter')
            .should('eq', 'location:"Hancock, MN","regression"');
        });
      });
    });
  });
});
