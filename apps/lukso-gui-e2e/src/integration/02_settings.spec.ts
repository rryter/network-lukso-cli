describe('lukso-gui', () => {
  beforeEach(() => cy.visit('/settings'));

  it('should display welcome message', () => {
    cy.intercept({
      method: 'POST', // Route all GET requests
      url: '/settings', // that have a URL that matches '/users/*'
    }).as('saveSettings');

    cy.get('legend').contains('Settings');
    cy.get('#hostName').type('ExampleHostName');
    cy.get('#coinbase').type('InvalidCoinbase');
    cy.get('.is-danger .error').contains(
      'This must be a valid public key / address'
    );
    cy.get('#coinbase').clear();
    cy.get('#coinbase').type('0x2C2584D89ef2c9d58eb050cfEF3BfCBb3aa14878');
    cy.get('button').contains('Save Settings').click();

    cy.wait('@saveSettings').should(({ request, response }) => {
      expect(response?.statusCode).to.equal(200);
    });
  });
});
