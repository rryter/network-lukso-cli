import { getGreeting, getGenerateKeysButton } from '../support/validator.po';

describe('Settings', () => {
  beforeEach(() => cy.visit('/launchpad'));

  it('should display settings form and update settings', () => {
    cy.intercept({
      method: 'POST', // Route all GET requests
      url: '/launchpad/generate-keys', // that have a URL that matches '/users/*'
    }).as('generateKeys');

    getGreeting().contains('Become a Validator');
    cy.get('[data-e2e="validator.increase"]').click().click().click();
    cy.get('[data-e2e="validator.decrease"]').click().click();
    cy.get('[data-e2e="amountOfValidators"]').should('have.value', '2');
    cy.get('[data-e2e="pw"]').type('aA!23asde21');
    cy.get('[data-e2e="pwConfirm"]').type('aA!23asde21');
    getGenerateKeysButton().click();

    cy.wait('@generateKeys').should(({ request, response }) => {
      expect(response?.statusCode).to.equal(200);
    });
  });
});
