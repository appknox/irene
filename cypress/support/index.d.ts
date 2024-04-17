declare namespace Cypress {
  interface Chainable {
    getAliases<T>(names: string[]): Chainable<T[]>;
  }
}
