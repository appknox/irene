import LOGIN_PAGE_LOCATORS from '../../../locators/pages/LoginPage';

import { API_ROUTES } from '../../api.routes';
import { APPLICATION_ROUTES } from '../../application.routes';

import NetworkActions from '../common/NetworkActions';
import SessionActions from '../common/SessionActions';

const session = new SessionActions();
const network = new NetworkActions();

export interface UserLoginCredentialProps {
  username: string;
  password: string;
}

export default class LoginActions {
  /**
   * Logs user in with credentials using the UI
   */
  doLoginWithUI({ username, password }: UserLoginCredentialProps) {
    cy.visit(APPLICATION_ROUTES.login);

    network.loadAppConfigWithMockData();

    cy.get(LOGIN_PAGE_LOCATORS.usernameField).type(username);
    cy.get(LOGIN_PAGE_LOCATORS.userCheckIconBtn).click();

    cy.get(LOGIN_PAGE_LOCATORS.passwordField).type(password);
    cy.get(LOGIN_PAGE_LOCATORS.submitBtn).click();

    cy.intercept('POST', API_ROUTES.login).as('loginViaUI');
  }

  /**
   * Logs in with user credentials and caches session across specs
   */
  loginWithCredAndSaveSession(
    userCreds: UserLoginCredentialProps,
    cacheAcrossSpecs?: boolean
  ) {
    return session.createSessionWithCredentials(
      userCreds,
      () => this.doLoginWithUI(userCreds),
      cacheAcrossSpecs
    );
  }
}
