import { mockHomePage } from '../../support/utils';

const itemsPerPageOptions = ['10', '20', '30', '40', '50'];

describe('Pagination', () => {
  beforeEach(() => {
    mockHomePage();
  });

  describe('When the application loads', () => {
    it('pagination component is present', () => {
      cy.findByRole('searchbox').should('exist');
    });

    it('pagination has the correct initial settings', () => {
      // items per page
      cy.findByLabelText(/^Items per page/).should('have.value', '10');

      // page number
      cy.findByText('Page 1');
    });

    it('items per page has the correct options available', () => {
      itemsPerPageOptions.forEach(option => {
        cy.findByLabelText(/^Items per page/)
          .select(option)
          .should('have.value', option);
      });
    });
  });

  describe('When there are multiple pages of results', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/query?version=2019-01-01', {
        fixture: 'query/multiPageResults.json'
      }).as('postQueryMultiPage');
      cy.findByRole('searchbox').type('abil{enter}');
      cy.wait('@postQueryMultiPage');
    });

    it('lists the correct number of total pages', () => {
      cy.findByText('of 6 pages');
    });

    it('the previous page button is disabled', () => {
      cy.findByLabelText('Previous page').closest('button').should('be.disabled');
    });

    describe('and the next page arrow is clicked', () => {
      beforeEach(() => {
        cy.intercept('POST', '**/query?version=2019-01-01', {
          fixture: 'query/multiPageResults.json'
        }).as('nextPageQueryObject');
        cy.findByLabelText('Next page').click();
        cy.wait('@nextPageQueryObject');
      });

      it('correctly requests the next page', () => {
        cy.get('@nextPageQueryObject').its('request.body.offset').should('eq', 10);
      });

      describe('and the previous page arrow is clicked', () => {
        beforeEach(() => {
          cy.intercept('POST', '**/query?version=2019-01-01', {
            fixture: 'query/multiPageResults.json'
          }).as('prevPageQueryObject');
          cy.findByLabelText('Previous page').click();
          cy.wait('@prevPageQueryObject');
        });

        it('correctly requests the previous page', () => {
          cy.get('@prevPageQueryObject').its('request.body.offset').should('eq', 0);
        });
      });
    });

    describe('and we navigate to the last page of results', () => {
      beforeEach(() => {
        // click 'next' 5 times to get to end
        cy.findByLabelText('Next page').click().click().click().click().click();
        cy.wait('@postQueryMultiPage');
      });

      it('the next page button is disabled', () => {
        cy.findByLabelText('Next page').closest('button').should('be.disabled');
      });

      describe('and we increase the number of results per page to 50', () => {
        beforeEach(() => {
          cy.intercept('POST', '**/query?version=2019-01-01', {
            fixture: 'query/multiPageResults.json'
          }).as('largerpostQueryMultiPageObject');
          cy.findByLabelText(/^Items per page/).select('50');
          cy.wait('@largerpostQueryMultiPageObject');
        });

        it('returns to the first page, with the correct size', () => {
          cy.get('@largerpostQueryMultiPageObject').its('request.body.count').should('eq', 50);
          cy.get('@largerpostQueryMultiPageObject').its('request.body.offset').should('eq', 0);
          cy.findByTestId('current-page').should('contain', '1');
        });
      });
    });

    describe('and items per page is set to 20', () => {
      beforeEach(() => {
        cy.intercept('POST', '**/query?version=2019-01-01', {
          fixture: 'query/multiPageResults.json'
        }).as('twentyResultspostQueryMultiPageObject');
        cy.findByLabelText(/^Items per page/).select('20');
        cy.wait('@twentyResultspostQueryMultiPageObject');
      });

      it('makes a request for 20 results', () => {
        cy.get('@twentyResultspostQueryMultiPageObject').its('request.body.count').should('eq', 20);
      });

      it('only lists 3 pages of results', () => {
        cy.findByText('of 3 pages');
      });
    });

    describe('and items per page is set to 50', () => {
      beforeEach(() => {
        cy.intercept('POST', '**/query?version=2019-01-01', {
          fixture: 'query/multiPageResults.json'
        }).as('fiftyResultsPerPageQueryObject');
        cy.findByLabelText(/^Items per page/).select('50');
        cy.wait('@fiftyResultsPerPageQueryObject');
      });

      it('makes a request for 50 results', () => {
        cy.get('@fiftyResultsPerPageQueryObject').its('request.body.count').should('eq', 50);
      });

      it('only lists two pages of results', () => {
        cy.findByText('of 2 pages');
      });
    });
  });

  describe('When there is only one page of results', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/query?version=2019-01-01', { fixture: 'query/query.json' }).as(
        'postQuerySinglePage'
      );
      cy.findByRole('searchbox').type('abil{enter}');
      cy.wait('@postQuerySinglePage');
    });

    it('the next page and previous page buttons are disabled', () => {
      cy.findByLabelText('Previous page').closest('button').should('be.disabled');
      cy.findByLabelText('Next page').closest('button').should('be.disabled');
    });

    it('the first page is listed as the last page', () => {
      cy.findByTestId('current-page').should('contain', '1');
    });
  });
});
