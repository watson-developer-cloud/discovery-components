const itemsPerPageOptions = ['5', '10', '20', '30', '40', '50'];

describe('Pagination', () => {
  beforeEach(() => {
    // Sets up and handles the collections, component settings, and initial query requests that run on page-load
    cy.server();
    cy.fixture('collections/collections.json').as('collectionsJSON');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
    cy.fixture('component_settings/componentSettings.json').as('componentSettingsJSON');
    cy.route('GET', '**/component_settings?version=2019-01-01', '@componentSettingsJSON').as(
      'getComponentSettings'
    );
    cy.fixture('query/query.json').as('queryJSON');
    cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('postQuery');
    cy.visit('/');
    cy.wait(['@getCollections', '@getComponentSettings', '@postQuery']);

    // Set up/override routes & fixtures that are specific to this file
    cy.fixture('query/multiPageResults.json').as('multiPageResultsJSON');
  });

  describe('When the application loads', () => {
    it('pagination component is present', () => {
      cy.get('.bx--pagination').should('exist');
    });

    it('pagination has the correct initial settings', () => {
      // items per page
      cy.get('.bx--pagination__left') //TODO: change this selector to use id instead of class
        .find('.bx--select-input')
        .should('have.value', '5');
      // page number
      cy.get('.bx--pagination__right')
        .find('.bx--select-input')
        .should('have.value', '1');
    });

    it('items per page has the correct options available', () => {
      itemsPerPageOptions.forEach(option => {
        cy.get('.bx--pagination__left')
          .find('.bx--select-input')
          .select(option)
          .should('have.value', option);
      });
    });
  });

  describe('When there are multiple pages of results', () => {
    beforeEach(() => {
      cy.route('POST', '**/query?version=2019-01-01', '@multiPageResultsJSON').as('multiPageQuery');
      cy.get('.bx--search-input').type('abil{enter}');
      cy.wait('@multiPageQuery');
    });

    it('lists the correct number of total pages', () => {
      cy.get('.bx--pagination__text').should('contain', '12');
    });

    it('the previous page button is disabled', () => {
      cy.get('.bx--pagination__button--backward').should('be.disabled');
    });

    describe('and the next page arrow is clicked', () => {
      beforeEach(() => {
        cy.get('.bx--pagination__button--forward').click();
        cy.wait('@multiPageQuery').as('nextPageQueryObject');
      });

      it('correctly requests the next page', () => {
        cy.get('@nextPageQueryObject')
          .its('requestBody.offset')
          .should('eq', 5);
      });

      describe('and the previous page arrow is clicked', () => {
        beforeEach(() => {
          cy.get('.bx--pagination__button--backward').click();
          cy.wait('@multiPageQuery').as('prevPageQueryObject');
        });

        it('correctly requests the previous page', () => {
          cy.get('@prevPageQueryObject')
            .its('requestBody.offset')
            .should('eq', 0);
        });
      });
    });

    describe('and we use the page selector to go to the second page', () => {
      beforeEach(() => {
        cy.get('.bx--pagination__right')
          .find('.bx--select-input')
          .select('2');
        cy.wait('@multiPageQuery').as('secondPageQueryObject');
      });

      it('makes a query for the correct page of results', () => {
        cy.get('@secondPageQueryObject')
          .its('requestBody.offset')
          .should('eq', 5);
      });

      it('should display the correct page number in the page selector', () => {
        cy.get('span')
          .contains('6–10 of 60 results')
          .should('exist');
        cy.get('.bx--pagination__right')
          .find('.bx--select-input')
          .should('have.value', '2');
      });
    });

    describe('and we navigate to the last page of results', () => {
      beforeEach(() => {
        cy.get('.bx--pagination__right')
          .find('.bx--select-input')
          .select('12');
        cy.wait('@multiPageQuery');
      });

      it('the next page button is disabled', () => {
        cy.get('.bx--pagination__button--forward').should('be.disabled');
      });

      describe('and we increase the number of results per page to 50', () => {
        beforeEach(() => {
          cy.get('.bx--pagination__left')
            .find('.bx--select-input')
            .select('50');
          cy.wait('@multiPageQuery').as('largerMultiPageQueryObject');
        });

        it('returns to the first page, with the correct size', () => {
          cy.get('@largerMultiPageQueryObject')
            .its('requestBody.count')
            .should('eq', 50);
          cy.get('@largerMultiPageQueryObject')
            .its('requestBody.offset')
            .should('eq', 0);
          cy.get('.bx--pagination__right')
            .find('.bx--select-input')
            .should('have.value', '1');
        });
      });
    });

    describe('and items per page is set to 5', () => {
      beforeEach(() => {
        cy.get('.bx--pagination__left')
          .find('.bx--select-input')
          .select('5');
        cy.wait('@multiPageQuery').as('fiveResultsMultiPageQueryObject');
      });

      it('makes a request for 5 results', () => {
        cy.get('@fiveResultsMultiPageQueryObject')
          .its('requestBody.count')
          .should('eq', 5);
      });

      it('only lists twelve pages of results', () => {
        cy.get('.bx--pagination__text').should('contain', '12');
      });
    });

    describe('and items per page is set to 10', () => {
      beforeEach(() => {
        cy.get('.bx--pagination__left')
          .find('.bx--select-input')
          .select('10');
        cy.wait('@multiPageQuery').as('tenResultsPerPageQueryObject');
      });

      it('makes a request for 10 results', () => {
        cy.get('@tenResultsPerPageQueryObject')
          .its('requestBody.count')
          .should('eq', 10);
      });

      it('only lists six pages of results', () => {
        cy.get('.bx--pagination__text').should('contain', '6');
      });
    });

    describe('and items per page is set to 50', () => {
      beforeEach(() => {
        cy.get('.bx--pagination__left')
          .find('.bx--select-input')
          .select('50');
        cy.wait('@multiPageQuery').as('fiftyResultsPerPageQueryObject');
      });

      it('makes a request for 50 results', () => {
        cy.get('@fiftyResultsPerPageQueryObject')
          .its('requestBody.count')
          .should('eq', 50);
      });

      it('only lists two pages of results', () => {
        cy.get('.bx--pagination__text').should('contain', '2');
      });
    });
  });

  describe('When there is only one page of results', () => {
    it('the next page and previous page buttons are disabled', () => {
      cy.get('.bx--pagination__button--forward').should('be.disabled');
      cy.get('.bx--pagination__button--backward').should('be.disabled');
    });

    it('the first page is listed as the last page', () => {
      cy.get('.bx--pagination__text').should('contain', '1');
    });
  });
});
