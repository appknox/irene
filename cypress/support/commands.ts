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

// =======================
// 🔴 WS INTERCEPT COMMAND
// =======================

Cypress.Commands.add('interceptWsMessage', (predicate, options = {}) => {
  const timeout = options.timeout ?? 120000;

  return cy.window().then((win: any) => {
    return cy.then({ timeout }, () => {
      return new Cypress.Promise<void>((resolve, reject) => {
        const start = Date.now();

        const interval = setInterval(() => {
          const messages = win.__wsMessages as unknown[];

          if (Array.isArray(messages)) {
            for (const raw of messages) {
              if (typeof raw === 'string' && raw.startsWith('42')) {
                try {
                  const [event, payload] = JSON.parse(raw.slice(2));

                  if (predicate(event, payload, raw)) {
                    clearInterval(interval);
                    resolve();
                    return;
                  }
                } catch {
                  // ignore malformed frames
                }
              }
            }
          }

          if (Date.now() - start > timeout) {
            clearInterval(interval);
            reject(new Error('Timed out waiting for matching WS message'));
          }
        }, 300);
      });
    });
  });
});

export {};
