declare namespace Cypress {
  type CutomCypressSelectCommand<E extends Node = HTMLElement> = (
    selector: string,
    opts?: Partial<Loggable & Timeoutable & Withinable & Shadow>
  ) => Chainable<JQuery<E>>;

  interface Chainable {
    getAliases<T>(names: string[]): Chainable<T[]>;

    getBySel: CutomCypressSelectCommand;
    getBySelLike: CutomCypressSelectCommand;

    makeAuthenticatedAPIRequest: <ResObj>(
      options: Partial<Cypress.RequestOptions>
    ) => Cypress.Chainable<Cypress.Response<ResObj>>;
  }
}
