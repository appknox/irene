import { getAliasName } from '../../utils';
import SessionActions from '../common/SessionActions';
import APP_TRANSLATIONS from '../../translations';
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

    cy.findByPlaceholderText('Username / Email').type(username); // Username/Email field
    cy.findByLabelText('login-user-check-icon').click();

    cy.wait('@checkUserRoute');

    cy.findByPlaceholderText('Password').type(password); // Password field
    cy.findByLabelText('login-submit-button').click();

    cy.wait('@loginAPIReq');
  }

  /**
   * Logs user in via SSO using the UI
   */
  doLoginViaSSO({ username }: Omit<UserLoginCredentialProps, 'password'>) {
    // Intercepts user check request
    cy.intercept(API_ROUTES.check.route).as('checkUserRoute');

    // Intercepts frontend config request
    cy.intercept(API_ROUTES.frontendConfig.route).as('frontendConfig');

    cy.intercept(API_ROUTES.saml2Login.route).as('saml2LoginApiReq');

    cy.visit(APPLICATION_ROUTES.login);

    // Wait for frontend config request to resolve
    cy.wait('@frontendConfig');

    cy.findByPlaceholderText('Username / Email').type(username); // Username/Email field

    cy.findByLabelText('login-user-check-icon').click();

    cy.wait('@checkUserRoute');

    cy.contains(APP_TRANSLATIONS.ssoLogin).should('exist').click();

    cy.origin(
      'https://accounts.google.com',
      { args: { username, password: Cypress.env('TEST_GOOGLE_PASSWORD') } },
      ({ username, password }) => {
        cy.get('input[type="email"]').type(`${username}{enter}`);

        // Enter password
        cy.get('input[type="password"]').type(`${password}{enter}`);
      }
    );

    cy.wait('@saml2LoginApiReq');
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
        cy.findByText(APP_TRANSLATIONS.dontHaveAccount).should('exist');

        cy.findByText(APP_TRANSLATIONS.register)
          .should('exist')
          .should('have.attr', 'href', res.registration_link);
      }
    });

    cy.findByPlaceholderText('Username / Email').should('be.visible'); // Username/Email field
    cy.findAllByLabelText('login-user-check-icon').should('exist'); // User check button;
  }

  validateWhileLogin() {
    // If these elements are displayed, token is expired
    cy.findByPlaceholderText('Username / Email').should('not.exist'); // Username/Email field
    cy.findByLabelText('login-user-check-icon').should('not.exist'); // User check button;s

    // Validate presence of access token in localStorage.
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'ember_simple_auth-session')
      .should('exist');
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
          this.validateWhileLogin();
        },
      }
    );
  }

  /**
   * Logs in with SSO and caches session across specs
   */
  loginWithSSOAndSaveSession(
    userCreds: Omit<UserLoginCredentialProps, 'password'>,
    cacheAcrossSpecs = true
  ) {
    cy.session(
      session.createSessionIdWithSSO(userCreds),
      () => this.doLoginViaSSO(userCreds),
      {
        cacheAcrossSpecs,
        validate: () => {
          this.validateWhileLogin();
        },
      }
    );
  }

  /**
   * Assertions after Login
   */
  verifyDashboardElements() {
    // Assertion for different dashboard elements
    cy.findByText(APP_TRANSLATIONS.startNewScan).should('exist');
    cy.findByText(APP_TRANSLATIONS.uploadApp).should('exist');
    cy.findByText(APP_TRANSLATIONS.allProjects).should('exist');
    cy.findByText(APP_TRANSLATIONS.allProjectsDescription).should('exist');
    cy.findByText(APP_TRANSLATIONS.support).should('exist');
    cy.findByText(APP_TRANSLATIONS.knowledgeBase).should('exist');
  }
}
