import { getGreeting, getInstallButton } from '../support/app.po';

describe('lukso-gui', () => {
  beforeEach(() => cy.visit('/setup'));

  it('should display welcome message', () => {
    cy.intercept({
      method: 'POST',
      url: '/initial-setup',
    }).as('install');
    getGreeting().contains('Welcome on Board');
    getInstallButton().contains('Install now').click();

    cy.wait('@install', { timeout: 60_000 }).should(({ request, response }) => {
      expect(response?.statusCode).to.equal(200);
    });
  });
});
