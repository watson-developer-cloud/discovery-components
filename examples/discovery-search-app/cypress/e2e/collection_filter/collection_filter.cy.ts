import { mockHomePage } from '../../support/utils';

describe('Collection Filter', () => {
  beforeEach(() => {
    mockHomePage();
  });

  describe('when the example app loads', () => {
    it('the collection facet select is visible', () => {
      cy.contains('Available collections').should('be.visible');
    });
  });

  describe('when a query is made', () => {
    beforeEach(() => {
      cy.get('.bx--search-input').type('abil{enter}');
      cy.wait('@postQuery');
    });

    it('the collection selector should appear', () => {
      cy.get('#collection-facet-select').should('exist');
      cy.get('#collection-facet-select').contains('Available collections').should('exist');
    });

    describe('and we click the collection filter', () => {
      beforeEach(() => {
        cy.get('#collection-facet-select').click();
      });

      it('displays a list of the collections in the project', () => {
        cy.get('.bx--list-box__menu').contains('deadspin').should('exist');
        cy.get('.bx--list-box__menu').contains('espn').should('exist');
        cy.get('.bx--list-box__menu').contains('finnegans wake').should('exist');
      });

      describe('and we select a single collection', () => {
        beforeEach(() => {
          cy.intercept('POST', '**/query?version=2019-01-01', {
            fixture: 'query/singleCollectionQuery.json'
          }).as('postQuerySingleCollection');
          cy.get('.bx--list-box__menu-item').contains('finnegans wake').click();
          cy.wait('@postQuerySingleCollection').as('singleCollectionQueryObject');
        });

        it('should make a query against only the selected collection', () => {
          cy.get('@singleCollectionQueryObject')
            .its('request.body.collection_ids')
            .should('contain', 'paris19221939')
            .and('have.length', 1);
        });

        it('the clear all selected collections button appears', () => {
          cy.findByLabelText('Clear all selected items').should('exist');
        });

        describe('and we click the clear selected collections button', () => {
          beforeEach(() => {
            cy.intercept('POST', '**/query?version=2019-01-01', { fixture: 'query/query.json' }).as(
              'postQueryClearedSelections'
            );
            cy.get('div[aria-label="Clear all selected items"]').click();
            cy.wait('@postQueryClearedSelections').as('clearedCollectionsQueryObject');
          });

          it('makes a query against all available collections', () => {
            cy.get('@clearedCollectionsQueryObject')
              .its('request.body.collection_ids')
              .should('be.empty');
          });
        });

        describe('and we select another collection', () => {
          beforeEach(() => {
            cy.intercept('POST', '**/query?version=2019-01-01', {
              fixture: 'query/doubleCollectionQuery.json'
            }).as('postQueryDoubleCollection');
            cy.get('.bx--list-box__menu-item').contains('deadspin').click();
            cy.wait('@postQueryDoubleCollection').as('doubleCollectionQueryObject');
          });

          it('makes a query against both of the selected collections', () => {
            cy.get('@doubleCollectionQueryObject')
              .its('request.body.collection_ids')
              .should('contain', 'deadspin9876')
              .and('contain', 'paris19221939');
          });

          describe('and we clear the selected collections', () => {
            beforeEach(() => {
              cy.intercept('POST', '**/query?version=2019-01-01', {
                fixture: 'query/query.json'
              }).as('postQueryClearedSelections');
              cy.get('div[aria-label="Clear all selected items"]').click();
              cy.wait('@postQueryClearedSelections').as('originalQueryObject');
            });

            it('makes a query against all available collections', () => {
              cy.get('@originalQueryObject').its('request.body.collection_ids').should('be.empty');
            });
          });
        });
      });

      describe('and we click the selection box again', () => {
        beforeEach(() => {
          cy.get('#collection-facet-select').click();
        });

        it('the collection filter dropdown disappears', () => {
          cy.get('#collection-facet-select').should('exist'); // keeps a white screen from passing the test
          cy.get('.bx--list-box__menu').should('not.be.visible');
        });
      });

      describe('and we click away from the selection box', () => {
        beforeEach(() => {
          cy.get('.bx--search-result').first().click();
        });

        it('the collection filter dropdown disappears', () => {
          cy.get('#collection-facet-select').should('exist'); // keeps a white screen from passing the test
          cy.get('.bx--list-box__menu').should('not.be.visible');
        });
      });
    });
  });
});
