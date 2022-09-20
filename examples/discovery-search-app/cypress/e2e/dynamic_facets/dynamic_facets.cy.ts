import { mockHomePage } from '../../support/utils';

const queryFixture = 'query/facetsQuery.json';

describe('Dynamic Facets', () => {
  it('When a query is made, and dynamic facets are returned', () => {
    mockHomePage({
      component_settings: 'component_settings/multiSelectFacetsComponentSettings.json',
      query: queryFixture
    });

    cy.findByPlaceholderText('Search').type('restaurants{enter}');
    cy.wait('@postQuery');
    cy.get('.bx--search-facet').filter(':contains("Dynamic Facets")').as('dynamicFacets');
    // set aliases for the dynamic facet filters
    cy.get('@dynamicFacets').contains('regression').as('regressionFilter');
    cy.get('@dynamicFacets').contains('classification').as('classificationFilter');
    cy.get('@dynamicFacets').contains('naive bayes').as('naiveBayesFilter');

    // shows available dynamic facets listed on the side
    cy.get('@regressionFilter').should('exist');
    cy.get('@classificationFilter').should('exist');
    cy.get('@naiveBayesFilter').should('exist');

    // has dynamic facets displayed as checkboxes
    cy.get('@dynamicFacets').find('.bx--checkbox').should('have.length', 3);

    // and a dynamic facet filter is selected
    cy.intercept('POST', '**/query?version=2019-01-01', {
      fixture: 'query/facetsQuerySingleRefinement.json'
    }).as('postQueryFacetsSingle');
    cy.get('label').contains('regression').click();

    // makes a query for the right facets
    cy.wait('@postQueryFacetsSingle').its('request.body.filter').should('eq', '"regression"');

    // shows the bubble next to dynamic facets saying 1
    cy.get('.bx--tag--filter').contains('1').should('exist');

    // and a different filter is selected from dynamic facets
    cy.intercept('POST', '**/query?version=2019-01-01', {
      fixture: 'query/facetsQueryMultiRefinement.json'
    }).as('postQueryMultiRefinement');
    cy.get('label').contains('classification').click();

    // makes a query for both filters
    cy.wait('@postQueryMultiRefinement')
      .its('request.body.filter')
      .should('eq', '"regression","classification"');

    // shows the bubble next to dynamic facets saying 2
    cy.get('.bx--tag--filter').contains('2').should('exist');

    // and the "Clear all" button is clicked
    cy.intercept('POST', '**/query?version=2019-01-01', { fixture: queryFixture }).as(
      'postQueryFacets'
    );
    cy.get('button').contains('Clear all').click();

    // makes a query without any selected facets
    cy.wait('@postQueryFacets').its('request.body.filter').should('eq', '');

    // has the "Clear all" button disappear
    cy.findByText('Dynamic Facets').should('exist'); // make sure this test doesn't pass when the page is blank
    cy.get('button').contains('Clear all').should('not.exist');

    // and the same facet checkbox is clicked
    cy.intercept('POST', '**/query?version=2019-01-01', { fixture: queryFixture }).as(
      'postQueryFacets'
    );
    cy.get('label').contains('regression').click();

    // makes a query without any selected facets
    cy.wait('@postQueryFacets').its('request.body.filter').should('eq', '"regression"');

    // and a different filter is clicked from a different facet
    cy.intercept('POST', '**/query?version=2019-01-01', {
      fixture: 'query/facetsQueryDynamicAndNonDynamic.json'
    }).as('postQueryDynamicAndNonDynamic');
    cy.get('label').contains('Hancock, MN').click();

    // makes a query with both filters', () => {
    cy.wait('@postQueryDynamicAndNonDynamic')
      .its('request.body.filter')
      .should('eq', 'location::"Hancock, MN","regression"');
  });
});
