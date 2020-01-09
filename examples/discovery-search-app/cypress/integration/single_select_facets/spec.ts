describe('Single-Select Facets', () => {
  beforeEach(() => {
    //TODO: we'll need to make sure we can pass in an override for the query, as we want specific facets to come back
    // Sets up and handles the collections, component settings, and initial query requests that run on page-load
    cy.server();
    cy.fixture('collections/collections.json').as('collectionsJSON');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
    cy.fixture('query/query.json').as('queryJSON');
    cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQuery');

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
    cy.wait(['@getCollections', '@getComponentSettings', '@postQuery']);

    // Set up/override routes & fixtures that are specific to this file
  });

  describe('When a query is made, and facets are returned', () => {
    it('facets are displayed as radio buttons', () => {
      //TODO
    });

    describe('and a facet is selected', () => {
      it('makes a query for the right facets', () => {
        //TODO
      });

      it('only the results matching the queried facet are displayed', () => {
        //TODO
      });

      it('the selected facets bubble shows 1 selected facet', () => {
        //TODO
      });

      describe('and a different facet is selected', () => {
        it('makes a query for only the new facet', () => {
          //TODO
        });

        it('only the results matching the new facet are displayed', () => {
          //TODO
        });
      });

      describe('and the "Clear all" button is clicked', () => {
        it('makes a query without any selected facets', () => {
          //TODO
        });

        it('none of the facets are checked', () => {
          //TODO
        });

        it('the "Clear all" button disappears', () => {
          //TODO
        });
      });

      describe('and the "X" on the selected facets bubble is clicked', () => {
        it('makes a query without any selected facets', () => {
          //TODO
        });

        it('none of the facets are checked', () => {
          //TODO
        });

        it('the selected facets bubble disappears', () => {
          //TODO
        });
      });

      describe('and the same facet radio button is clicked', () => {
        it('makes a query without any selected facets', () => {
          //TODO
        });

        it('the facet is unselected', () => {
          //TODO
        });
      });
    });

    describe('and "Show more" is clicked', () => {
      it('the list of facets is expanded', () => {
        //TODO
      });

      describe('and "Show less" is clicked', () => {
        it('the list of facets is collapsed', () => {
          //TODO
        });
      });
    });
  });
});
