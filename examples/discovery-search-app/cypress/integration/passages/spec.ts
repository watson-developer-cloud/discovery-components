describe('Passage Results', () => {
  beforeEach(() => {
    cy.server();
    cy.fixture('collections/collections.json').as('collectionsJSON');
    cy.fixture('query/passageResults.json').as('passageResultsJSON');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
    cy.route('POST', '**/query?version=2019-01-01', '@passageResultsJSON').as('passagesQuery');
    cy.visit('/');
  });

  describe('When entering a query whose results contain passages', () => {
    beforeEach(() => {
      cy.get('.bx--search-input').type('ibm{enter}');
    });

    it('SearchResults displays the first passage text of the results that have passages', () => {
      //TODO
    });

    it('each result with a passage has a link to view passage in document', () => {
      //TODO
    });

    it('the passage text in each result is dangerously rendered', () => {
      //TODO: check for em tags, etc.
    });
  });
});
