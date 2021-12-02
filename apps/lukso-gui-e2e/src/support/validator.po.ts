export const getGreeting = () => cy.get('h3');
export const getGenerateKeysButton = () =>
  cy.get('button').contains('Generate Keys');
