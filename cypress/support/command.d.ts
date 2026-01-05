declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Intercepts Socket.IO WebSocket messages captured by the global WS hook.
       * Resolves when predicate returns true.
       */
      interceptWsMessage(
        predicate: (event: string, payload: any, raw: string) => boolean,
        options?: { timeout?: number }
      ): Chainable<void>;
    }
  }
}

export {};
