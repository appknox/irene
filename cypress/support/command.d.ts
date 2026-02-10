declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Intercepts Socket.IO WebSocket messages captured by the global WS hook.
       * Resolves when predicate returns true.
       */
      interceptWsMessage<T = unknown>(
        predicate: (
          event: 'model_created' | 'model_updated',
          payload: T,
          raw: string
        ) => boolean,
        options?: { timeout?: number }
      ): Chainable<void>;
    }
  }
}

export {};
