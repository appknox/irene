import { UserLoginCredentialProps } from '../auth/LoginActions';

export default class SessionActions {
  private _createSessionIdWithCreds({
    username,
    password,
  }: UserLoginCredentialProps) {
    return `${username}-${password}`;
  }

  createSessionWithCredentials(
    userData: UserLoginCredentialProps,
    loginFn: () => void,
    cacheAcrossSpecs = true
  ) {
    return cy.session(this._createSessionIdWithCreds(userData), loginFn, {
      cacheAcrossSpecs,
    });
  }

  resetCurrentSession() {
    return Cypress.session.clearCurrentSessionData();
  }

  resetAllSessions() {
    return Cypress.session.clearAllSavedSessions();
  }

  async getCurrentSession(userData: UserLoginCredentialProps) {
    return await Cypress.session.getSession(
      this._createSessionIdWithCreds(userData)
    );
  }
}
