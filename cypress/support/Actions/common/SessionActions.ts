import { UserLoginCredentialProps } from '../auth/LoginActions';

export default class SessionActions {
  createSessionIdWithCreds({ username, password }: UserLoginCredentialProps) {
    return `${username}-${password}`;
  }

  resetCurrentSession() {
    return Cypress.session.clearCurrentSessionData();
  }

  resetAllSessions() {
    return Cypress.session.clearAllSavedSessions();
  }

  async getCurrentSession(userData: UserLoginCredentialProps) {
    return await Cypress.session.getSession(
      this.createSessionIdWithCreds(userData)
    );
  }
}
