import { mockHomePage } from '../../support/utils';

const itemsPerPageOptions = ['5', '10', '20', '30', '40', '50'];

describe('Pagination', () => {
  beforeEach(() => {
    mockHomePage();

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
      cy.route('POST', '**/query?version=2019-01-01', '@multiPageResultsJSON').as(
        'postQueryMultiPage'
      );
      cy.get('.bx--search-input').type('abil{enter}');
      cy.wait('@postQueryMultiPage');
    });

    it('lists the correct number of total pages', () => {
      cy.get('.bx--pagination__text').should('contain', '12');
    });

    it('the previous page button is disabled', () => {
      cy.get('.bx--pagination__button--backward').should('be.disabled');
    });

    describe('and the next page arrow is clicked', () => {
      beforeEach(() => {
        cy.route('POST', '**/query?version=2019-01-01', '@multiPageResultsJSON').as(
          'nextPageQueryObject'
        );
        cy.get('.bx--pagination__button--forward').click();
        cy.wait('@nextPageQueryObject');
      });

      it('correctly requests the next page', () => {
        cy.get('@nextPageQueryObject')
          .its('requestBody.offset')
          .should('eq', 5);
      });

      describe('and the previous page arrow is clicked', () => {
        beforeEach(() => {
          cy.route('POST', '**/query?version=2019-01-01', '@multiPageResultsJSON').as(
            'prevPageQueryObject'
          );
          cy.get('.bx--pagination__button--backward').click();
          cy.wait('@prevPageQueryObject');
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
        cy.route('POST', '**/query?version=2019-01-01', '@multiPageResultsJSON').as(
          'nextPageQueryObject'
        );
        cy.get('.bx--pagination__right')
          .find('.bx--select-input')
          .select('2');
        cy.wait('@nextPageQueryObject');
      });

      it('makes a query for the correct page of results', () => {
        cy.get('@nextPageQueryObject')
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

      describe('and we submit a new query', () => {
        it('should return to the first page', () => {
          cy.get('.bx--pagination__right')
            .find('.bx--select-input')
            .should('have.value', '2');
          cy.findByPlaceholderText('Search').type('something{enter}');
          cy.get('.bx--pagination__right')
            .find('.bx--select-input')
            .should('have.value', '1');
        });
      });
    });

    describe('and we navigate to the last page of results', () => {
      beforeEach(() => {
        cy.get('.bx--pagination__right')
          .find('.bx--select-input')
          .select('12');
        cy.wait('@postQueryMultiPage');
      });

      it('the next page button is disabled', () => {
        cy.get('.bx--pagination__button--forward').should('be.disabled');
      });

      describe('and we increase the number of results per page to 50', () => {
        beforeEach(() => {
          cy.route('POST', '**/query?version=2019-01-01', '@multiPageResultsJSON').as(
            'largerpostQueryMultiPageObject'
          );
          cy.get('.bx--pagination__left')
            .find('.bx--select-input')
            .select('50');
          cy.wait('@largerpostQueryMultiPageObject');
        });

        it('returns to the first page, with the correct size', () => {
          cy.get('@largerpostQueryMultiPageObject')
            .its('requestBody.count')
            .should('eq', 50);
          cy.get('@largerpostQueryMultiPageObject')
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
        cy.route('POST', '**/query?version=2019-01-01', '@multiPageResultsJSON').as(
          'fiveResultspostQueryMultiPageObject'
        );
        cy.get('.bx--pagination__left')
          .find('.bx--select-input')
          .select('5');
        cy.wait('@fiveResultspostQueryMultiPageObject');
      });

      it('makes a request for 5 results', () => {
        cy.get('@fiveResultspostQueryMultiPageObject')
          .its('requestBody.count')
          .should('eq', 5);
      });

      it('only lists twelve pages of results', () => {
        cy.get('.bx--pagination__text').should('contain', '12');
      });
    });

    describe('and items per page is set to 10', () => {
      beforeEach(() => {
        cy.route('POST', '**/query?version=2019-01-01', '@multiPageResultsJSON').as(
          'tenResultsPerPageQueryObject'
        );
        cy.get('.bx--pagination__left')
          .find('.bx--select-input')
          .select('10');
        cy.wait('@tenResultsPerPageQueryObject');
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
        cy.route('POST', '**/query?version=2019-01-01', '@multiPageResultsJSON').as(
          'fiftyResultsPerPageQueryObject'
        );
        cy.get('.bx--pagination__left')
          .find('.bx--select-input')
          .select('50');
        cy.wait('@fiftyResultsPerPageQueryObject');
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
