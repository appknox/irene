/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

import '@testing-library/cypress/add-commands';

Cypress.Commands.add(
  'getAliases',
  <T>(names: string[]): Cypress.Chainable<T[]> => {
    const values: T[] = [];

    for (const arg of names) {
      cy.get<T>(arg).then((value) => values.push(value));
    }

    return cy.wrap(values);
  }
);

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-test=${selector}]`, ...args);
});

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-test*=${selector}]`, ...args);
});

Cypress.Commands.add(
  'makeAuthenticatedAPIRequest',
  <ResObj>(
    options: Partial<Cypress.RequestOptions>
  ): Cypress.Chainable<Cypress.Response<ResObj>> => {
    return cy
      .window()
      .its('localStorage')
      .invoke('getItem', 'ember_simple_auth-session')
      .then((authInfo) => {
        const authDetails = authInfo ? JSON.parse(authInfo) : {};

        return cy.request<ResObj>({
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Basic ${authDetails['authenticated']['b64token']}`,
          },
        });
      });
  }
);
