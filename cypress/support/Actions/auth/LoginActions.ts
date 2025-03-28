import cyTranslate from '../../translations';
import { getAliasName } from '../../utils';

import SessionActions from '../common/SessionActions';

import { APPLICATION_ROUTES } from '../../application.routes';
import { API_ROUTES } from '../../api.routes';

const session = new SessionActions();

export interface UserLoginCredentialProps {
  username: string;
  password: string;
}

export default class LoginActions {
  /**
   * Logs user in with credentials using the UI
   */
  doLoginWithUI({ username, password }: UserLoginCredentialProps) {
    // Intercepts user check request
    cy.intercept(API_ROUTES.check.route).as('checkUserRoute');

    // Intercepts login request
    cy.intercept(API_ROUTES.login.route).as('loginAPIReq');

    // Intercepts frontend config request
    cy.intercept(API_ROUTES.frontendConfig.route).as('frontendConfig');

    cy.visit(APPLICATION_ROUTES.login);

    // Wait for frontend config request to resolve
    cy.wait('@frontendConfig');

    cy.findByPlaceholderText(
      cyTranslate('usernameEmailIdTextPlaceholder')
    ).type(username); // Username/Email field

    cy.findByLabelText('login-next-button').click();

    cy.wait('@checkUserRoute', { timeout: 30000 });

    cy.findByPlaceholderText(cyTranslate('passwordPlaceholder')).type(password); // Password field
    cy.findByLabelText('login-submit-button').click();

    cy.wait('@loginAPIReq', { timeout: 30000 });
  }

  /**
   * Checks login page elements based on backend response
   * Function intercepts the frontend configuration to perform programmatic checks
   */
  checkLoginPageElements(frontendConfigAlias: string) {
    // Programmatically check for page elements based on the frontend config
    cy.wait(getAliasName(frontendConfigAlias)).then(({ response }) => {
      const res = response?.body as Partial<IreneAPIResponses.FrontendConfig>;

      const images = res?.images;
      const hasLogo = images?.logo_on_darkbg || images?.logo_on_lightbg;
      const accountName = res?.name;

      // Programmatically checks for org logo on home page if available
      if (hasLogo && accountName) {
        cy.findAllByAltText(accountName).should('exist');
      }

      // Programmatically checks for reg link if available
      if (res.registration_link) {
        cy.findByText(cyTranslate('dontHaveAccount')).should('exist');

        cy.findByText(cyTranslate('registerToday')).should('exist');
      }
    });

    cy.findByPlaceholderText(
      cyTranslate('usernameEmailIdTextPlaceholder')
    ).should('be.visible'); // Username/Email field

    cy.findByLabelText('login-next-button'); // User check button;
  }

  /**
   * Logs in with user credentials and caches session across specs
   */
  loginWithCredAndSaveSession(
    userCreds: UserLoginCredentialProps,
    cacheAcrossSpecs = true
  ) {
    cy.session(
      session.createSessionIdWithCreds(userCreds),
      () => this.doLoginWithUI(userCreds),
      {
        cacheAcrossSpecs,
        validate: () => {
          // If these elements are displayed, token is expired
          cy.findByPlaceholderText(
            cyTranslate('usernameEmailIdTextPlaceholder')
          ).should('not.exist'); // Username/Email field

          cy.findByLabelText('login-next-button').should('not.exist'); // User check buttons

          // Validate presence of access token in localStorage.
          cy.window()
            .its('localStorage')
            .invoke('getItem', 'ember_simple_auth-session')
            .then((authInfo) => {
              const authDetails = authInfo ? JSON.parse(authInfo) : {};

              expect(authDetails)
                .and.to.have.property('authenticated')
                .to.have.any.keys('authenticator', 'b64token', 'token');
            });
        },
      }
    );
  }
}
