describe('basic test', () => {
  beforeEach(() => {
    cy.server();
    cy.fixture('basic/collections.json').as('collectionsJSON');
    cy.route('GET', '**/collections?version=2019-01-01', '@collectionsJSON').as('getCollections');
    cy.visit('/');
  });

  //TODO: 'example app doesn't crash' test
});
