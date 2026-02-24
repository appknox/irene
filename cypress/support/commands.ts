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
Cypress.Commands.add(
  'interceptWsMessage',
  <T = unknown>(
    predicate: (
      event: 'model_created' | 'model_updated',
      payload: T,
      raw: string
    ) => boolean,
    options: { timeout?: number } = {}
  ) => {
    const timeout = options.timeout ?? 120000;

    return cy.window().then((win) => {
      return cy.then({ timeout }, () => {
        return new Cypress.Promise<void>((resolve, reject) => {
          const messages = (
            win as unknown as Cypress.AUTWindow & { __wsMessages: unknown[] }
          ).__wsMessages;

          const parseAndCheck = (raw: unknown): boolean => {
            if (typeof raw === 'string' && raw.startsWith('42')) {
              try {
                const [event, payload] = JSON.parse(raw.slice(2)) as [
                  'model_created' | 'model_updated',
                  T,
                ];
                return predicate(event, payload, raw);
              } catch {
                // ignore malformed frames
              }
            }
            return false;
          };

          // Check existing messages first
          if (Array.isArray(messages)) {
            for (const raw of messages) {
              if (parseAndCheck(raw)) {
                resolve();
                return;
              }
            }
          }

          // Set up timeout
          const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('Timed out waiting for matching WS message'));
          }, timeout);

          // Patch array methods to detect new messages
          const originalPush = messages.push.bind(messages);
          const originalUnshift = messages.unshift.bind(messages);

          // Cleanup timeout and reset array methods
          const cleanup = () => {
            clearTimeout(timeoutId);

            messages.push = originalPush;
            messages.unshift = originalUnshift;
          };

          // OnNew Message Callback
          const onNewMessage = (raw: unknown) => {
            if (parseAndCheck(raw)) {
              cleanup();
              resolve();

              return true;
            }

            return false;
          };

          // Patch push method to detect new messages
          messages.push = function (...items: unknown[]) {
            const result = originalPush(...items);
            items.some(onNewMessage);

            return result;
          };

          // Patch unshift method to detect new messages
          messages.unshift = function (...items: unknown[]) {
            const result = originalUnshift(...items);
            items.some(onNewMessage);

            return result;
          };
        });
      });
    });
  }
);
