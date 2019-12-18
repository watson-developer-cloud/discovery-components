const itemsPerPageOptions = ['5', '10', '20', '30', '40', '50'];

describe('Pagination', () => {
  beforeEach(() => {
    cy.server({ force404: true });
    cy.fixture('basic/query.json').as('queryJSON');
    cy.fixture('basic/collections.json').as('collectionsJSON');
    cy.fixture('basic/componentSettings.json').as('componentSettingsJSON');
    cy.fixture('pagination/multiPageResults.json').as('multiPageResultsJSON');
    cy.route('GET', '**/component_settings?version=2019-01-01', '@componentSettingsJSON').as(
      'componentSettings'
    );
    cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('searchQuery');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
    cy.visit('/');
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
    });

    it('lists the correct number of total pages', () => {
      cy.get('.bx--pagination__text').should('contain', '12');
    });

    it('the previous page button is disabled', () => {
      cy.get('.bx--pagination__button--backward').should('be.disabled');
    });

    describe('and the next page arrow is clicked', () => {
      beforeEach(() => {
        cy.wait('@multiPageQuery');
        cy.get('.bx--pagination__button--forward').click();
      });

      it('correctly requests the next page', () => {
        cy.wait('@multiPageQuery')
          .its('requestBody.offset')
          .should('eq', 5);
      });

      describe('and the previous page arrow is clicked', () => {
        beforeEach(() => {
          cy.wait('@multiPageQuery');
          cy.get('.bx--pagination__button--backward').click();
        });

        it('correctly requests the previous page', () => {
          cy.wait('@multiPageQuery')
            .its('requestBody.offset')
            .should('eq', 0);
        });
      });
    });

    describe('and we use the page selector', () => {
      beforeEach(() => {
        cy.wait('@multiPageQuery');
      });

      it('we can navigate to each page of results', () => {
        for (let i = 0; i < 12; i++) {
          cy.get('.bx--pagination__right')
            .find('.bx--select-input')
            .select(`${i + 1}`);
          cy.wait('@multiPageQuery')
            .its('requestBody.offset')
            .should('eq', i * 5);
        }
      });
    });

    describe('and we navigate to the last page of results', () => {
      beforeEach(() => {
        cy.wait('@multiPageQuery');
        cy.get('.bx--pagination__right')
          .find('.bx--select-input')
          .select('12');
      });

      it('the next page button is disabled', () => {
        cy.wait('@multiPageQuery');
        cy.get('.bx--pagination__button--forward').should('be.disabled');
      });

      describe('and we increase the number of results per page to 50', () => {
        beforeEach(() => {
          cy.get('.bx--pagination__left')
            .find('.bx--select-input')
            .select('50');
        });

        it('returns to the first page, with the correct size', () => {
          cy.wait('@multiPageQuery');
          cy.wait('@multiPageQuery').then(xhr => {
            expect(xhr.requestBody.count).to.eq(50);
            expect(xhr.requestBody.offset).to.eq(0);
          });
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
      });

      it('makes a request for 5 results', () => {
        cy.wait('@multiPageQuery'); // not the request we're looking for
        cy.wait('@multiPageQuery')
          .its('requestBody.count')
          .should('eq', 5);
      });

      it('only lists twelve pages of results', () => {
        cy.wait('@multiPageQuery');
        cy.wait('@multiPageQuery');
        cy.get('.bx--pagination__text').should('contain', '12');
      });
    });

    describe('and items per page is set to 10', () => {
      beforeEach(() => {
        cy.get('.bx--pagination__left')
          .find('.bx--select-input')
          .select('10');
      });

      it('makes a request for 10 results', () => {
        cy.wait('@multiPageQuery'); // not the request we're looking for
        cy.wait('@multiPageQuery')
          .its('requestBody.count')
          .should('eq', 10);
      });

      it('only lists six pages of results', () => {
        cy.wait('@multiPageQuery');
        cy.wait('@multiPageQuery');
        cy.get('.bx--pagination__text').should('contain', '6');
      });
    });

    describe('and items per page is set to 50', () => {
      beforeEach(() => {
        cy.get('.bx--pagination__left')
          .find('.bx--select-input')
          .select('50');
      });

      it('makes a request for 50 results', () => {
        cy.wait('@multiPageQuery'); // not the request we're looking for
        cy.wait('@multiPageQuery')
          .its('requestBody.count')
          .should('eq', 50);
      });

      it('only lists two pages of results', () => {
        cy.wait('@multiPageQuery');
        cy.wait('@multiPageQuery');
        cy.get('.bx--pagination__text').should('contain', '2');
      });
    });
  });

  describe('When there is only one page of results', () => {
    beforeEach(() => {
      cy.route('POST', '**/query?version=2019-01-01', '@queryJSON').as('searchQuery');
    });

    it('the next page and previous page buttons are disabled', () => {
      cy.get('.bx--pagination__button--forward').should('be.disabled');
      cy.get('.bx--pagination__button--backward').should('be.disabled');
    });

    it('the first page is listed as the last page', () => {
      cy.get('.bx--pagination__text').should('contain', '1');
    });
  });
});
