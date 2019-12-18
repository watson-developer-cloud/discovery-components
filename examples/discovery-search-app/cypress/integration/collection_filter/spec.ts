describe('Collection Filter', () => {
  beforeEach(() => {
    cy.server({ force404: true });
    cy.fixture('basic/collections.json').as('collectionsJSON');
    cy.fixture('basic/componentSettings.json').as('componentSettingsJSON');
    cy.fixture('basic/query.json').as('queryJSON');
    cy.fixture('collection_filter/singleCollectionQuery.json').as('singleCollectionQueryJSON');
    cy.fixture('collection_filter/doubleCollectionQuery.json').as('doubleCollectionQueryJSON');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
    cy.route('GET', '**/component_settings?version=2019-01-01').as('componentSettings');
    cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQuery');
    cy.visit('/');
  });

  describe('when the example app loads', () => {
    it('the collection facet select does not appear', () => {
      cy.get('.collection-facet-select').should('not.exist');
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
            'singleCollectionQuery'
          );
          cy.get('.bx--list-box__menu-item')
            .contains('finnegans wake')
            .click();
        });

        it('should make a query against only the selected collection', () => {
          cy.wait('@singleCollectionQuery')
            .its('requestBody.collection_ids')
            .should('contain', 'paris19221939');
        });

        it('the clear all selected collections button appears', () => {
          cy.wait('@singleCollectionQuery');
          cy.get('div[aria-label="Clear Selection"]').should('exist');
        });

        describe('and we click the clear selected collections button', () => {
          beforeEach(() => {
            cy.wait('@singleCollectionQuery');
            cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('queryPost');
            cy.get('div[aria-label="Clear Selection"]').click();
          });

          it('makes a query against all available collections', () => {
            cy.wait('@queryPost')
              .its('requestBody.collection_ids')
              .should('be.empty');
          });
        });

        describe('and we select another collection', () => {
          beforeEach(() => {
            cy.wait('@singleCollectionQuery');
            cy.route('POST', '**/query?version=2019-01-01', 'doubleCollectionQueryJSON').as(
              'doubleCollectionQuery'
            );
            cy.get('.bx--list-box__menu-item')
              .contains('deadspin')
              .click();
          });

          it('makes a query against both of the selected collections', () => {
            cy.wait('@doubleCollectionQuery')
              .its('requestBody.collection_ids')
              .should('contain', 'deadspin9876')
              .and('contain', 'paris19221939');
          });

          describe('and we clear the selected collections', () => {
            beforeEach(() => {
              cy.wait('@doubleCollectionQuery');
              cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('queryPost');
              cy.get('div[aria-label="Clear Selection"]').click();
            });

            it('makes a query against all available collections', () => {
              cy.wait('@queryPost')
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
          cy.get('#collection-facet-select__menu').should('not.exist');
        });
      });
    });
  });
});
