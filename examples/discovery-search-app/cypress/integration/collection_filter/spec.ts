import { mockHomePage } from '../../support/utils';

describe('Collection Filter', () => {
  beforeEach(() => {
    mockHomePage();

    // Set up/override routes & fixtures that are specific to this file
    cy.fixture('query/singleCollectionQuery.json').as('singleCollectionQueryJSON');
    cy.fixture('query/doubleCollectionQuery.json').as('doubleCollectionQueryJSON');
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
      cy.get('#collection-facet-select')
        .contains('Available collections')
        .should('exist');
    });

    describe('and we click the collection filter', () => {
      beforeEach(() => {
        cy.get('#collection-facet-select').click();
      });

      it('displays a list of the collections in the project', () => {
        cy.get('#collection-facet-select__menu')
          .contains('deadspin')
          .should('exist');
        cy.get('#collection-facet-select__menu')
          .contains('espn')
          .should('exist');
        cy.get('#collection-facet-select__menu')
          .contains('finnegans wake')
          .should('exist');
      });

      describe('and we select a single collection', () => {
        beforeEach(() => {
          cy.route('POST', '**/query?version=2019-01-01', '@singleCollectionQueryJSON').as(
            'postQuerySingleCollection'
          );
          cy.get('.bx--list-box__menu-item')
            .contains('finnegans wake')
            .click();
          cy.wait('@postQuerySingleCollection').as('singleCollectionQueryObject');
        });

        it('should make a query against only the selected collection', () => {
          cy.get('@singleCollectionQueryObject')
            //@ts-ignore TODO: we'll need to handle typings for `cy.its` at some point, but for now, we'll ignore the error on the parameter string
            .its('requestBody.collection_ids')
            .should('contain', 'paris19221939')
            .and('have.length', 1);
        });

        it('the clear all selected collections button appears', () => {
          cy.findByLabelText('Clear Selection').should('exist');
        });

        describe('and we click the clear selected collections button', () => {
          beforeEach(() => {
            cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('newPostQuery');
            cy.get('div[aria-label="Clear Selection"]').click();
            cy.wait('@newPostQuery').as('clearedCollectionsQueryObject');
          });

          it('makes a query against all available collections', () => {
            cy.get('@clearedCollectionsQueryObject')
              //@ts-ignore TODO: we'll need to handle typings for `cy.its` at some point, but for now, we'll ignore the error on the parameter string
              .its('requestBody.collection_ids')
              .should('be.empty');
          });
        });

        describe('and we select another collection', () => {
          beforeEach(() => {
            cy.route('POST', '**/query?version=2019-01-01', 'doubleCollectionQueryJSON').as(
              'postQueryDoubleCollection'
            );
            cy.get('.bx--list-box__menu-item')
              .contains('deadspin')
              .click();
            cy.wait('@postQueryDoubleCollection').as('doubleCollectionQueryObject');
          });

          it('makes a query against both of the selected collections', () => {
            cy.get('@doubleCollectionQueryObject')
              //@ts-ignore TODO: we'll need to handle typings for `cy.its` at some point, but for now, we'll ignore the error on the parameter string//@ts-ignore
              .its('requestBody.collection_ids')
              .should('contain', 'deadspin9876')
              .and('contain', 'paris19221939');
          });

          describe('and we clear the selected collections', () => {
            beforeEach(() => {
              cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('newPostQuery');
              cy.get('div[aria-label="Clear Selection"]').click();
              cy.wait('@newPostQuery').as('originalQueryObject');
            });

            it('makes a query against all available collections', () => {
              cy.get('@originalQueryObject')
                //@ts-ignore TODO: we'll need to handle typings for `cy.its` at some point, but for now, we'll ignore the error on the parameter string
                .its('requestBody.collection_ids')
                .should('be.empty');
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
          cy.get('#collection-facet-select__menu').should('not.exist');
        });
      });

      describe('and we click away from the selection box', () => {
        beforeEach(() => {
          cy.get('.bx--search-result')
            .first()
            .click();
        });

        it('the collection filter dropdown disappears', () => {
          cy.get('#collection-facet-select').should('exist'); // keeps a white screen from passing the test
          cy.get('#collection-facet-select__menu').should('not.exist');
        });
      });
    });
  });
});
