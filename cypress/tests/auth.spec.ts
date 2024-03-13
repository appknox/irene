import APP_TRANSLATIONS from '../support/translations';
import { mirageServer, MirageFactoryDefProps } from '../support/Mirage';

import LoginActions from '../support/Actions/auth/LoginActions';
import NetworkActions from '../support/Actions/common/NetworkActions';

import { API_ROUTES } from '../support/api.routes';
import { APPLICATION_ROUTES } from '../support/application.routes';

// Grouped test Actions
const loginActions = new LoginActions();
const networkActions = new NetworkActions();

// User credentials
const username = Cypress.env('TEST_USERNAME');
const password = Cypress.env('TEST_PASSWORD');

describe('User Login', () => {
  beforeEach(() => {
    networkActions.hideNetworkLogsFor({ ...API_ROUTES.websockets });

    cy.intercept(API_ROUTES.check.route).as('checkUserRoute');
    cy.intercept(API_ROUTES.userInfo.route).as('userInfoRoute');

    //  Intercept vulnerabilities route
    networkActions.mockNetworkReq({
      ...API_ROUTES.vulnerabilityList,
      dataOverride: {
        data: mirageServer.createRecordList('vulnerability', 1).map((_) => ({
          id: _.id,
          type: 'vulnerabilities',
          attributes: _,
          relationships: {},
        })),
      },
    });

    //  Intercept unknown analysis request
    const unknownAnalysisStatus = mirageServer.createRecord(
      'unknown-analysis-status'
    );

    networkActions.mockNetworkReq({
      ...API_ROUTES.unknownAnalysisStatus,
      dataOverride: unknownAnalysisStatus,
    });

    //  Intercept file request
    const file = mirageServer.createRecord('file');

    networkActions.mockNetworkReq({
      ...API_ROUTES.file,
      dataOverride: file,
    });

    //  Intercept projects route
    networkActions.mockPaginatedNetworkReq({
      ...API_ROUTES.projectList,
      resDataOverride: {
        results: mirageServer
          .createRecordList('project', 1)
          .map((_) => ({ ..._, file: file.id })),
      },
    });

    //  Return empty submissions data
    networkActions.mockPaginatedNetworkReq({
      route: API_ROUTES.submissionList.route,
      alias: 'submissionList',
      resDataOverride: {
        results: [],
      },
    });
  });

  it('should redirect unauthenticated user to login page', function () {
    // Intercepts frontend config route
    const frontendConfigAlias = API_ROUTES.frontendConfig.alias;
    cy.intercept(API_ROUTES.frontendConfig.route).as(frontendConfigAlias);

    // Visit an authenticated route
    cy.visit(APPLICATION_ROUTES.projects);

    // Check if in login page
    cy.url().should('contain', APPLICATION_ROUTES.login);

    // Login page title
    cy.findByText(APP_TRANSLATIONS.login).should('exist');

    // Programmatically checks for login page elements
    loginActions.checkLoginPageElements(frontendConfigAlias);
  });

  it('should throw an error if user credentials are invalid', () => {
    const errorMessage = 'Unable to log in with provided credentials.';

    // Mocks Frontend and Server configs
    const { frontendConfigAlias } =
      networkActions.loadAppConfigWithFixtureData();

    // Mock Login request to fail
    networkActions.mockNetworkReq({
      method: 'POST',
      route: API_ROUTES.login.route,
      alias: 'failedLoginAttempt',
      dataOverride: {
        statusCode: 401,
        body: {
          message: errorMessage,
          attempt_left: '4',
          failure_limit: '5',
        },
      },
    });

    // Go to login page
    cy.visit(APPLICATION_ROUTES.login);

    // Check for login page elements
    loginActions.checkLoginPageElements(frontendConfigAlias);

    // Logs user to dashboard via UI
    // CASE: Invalid Password
    loginActions.doLoginWithUI({ username, password: 'password' });
    cy.wait('@failedLoginAttempt');

    cy.findByText(errorMessage);

    // CASE: Invalid Username
    loginActions.doLoginWithUI({ username: 'username', password });
    cy.findByText(errorMessage);
  });

  it('should redirect authenticated user to dashboard after logging in', () => {
    // Network interceptions
    cy.intercept(API_ROUTES.check.route).as('checkUserRoute');
    cy.intercept(API_ROUTES.userInfo.route).as('userInfoRoute');

    //  Intercept vulnerabilities route
    networkActions.mockNetworkReq({
      ...API_ROUTES.vulnerabilityList,
      dataOverride: {
        data: mirageServer.createRecordList('vulnerability', 1).map((it) => ({
          id: it.id,
          type: 'vulnerabilities',
          attributes: it,
          relationships: {},
        })),
      },
    });

    //  Intercept unknown analysis request
    const unknownAnalysisStatus = mirageServer.createRecord(
      'unknown-analysis-status'
    );

    networkActions.mockNetworkReq({
      ...API_ROUTES.unknownAnalysisStatus,
      dataOverride: unknownAnalysisStatus.attrs,
    });

    //  Intercept file request
    const file = mirageServer.createRecord('file').attrs;

    networkActions.mockNetworkReq({
      ...API_ROUTES.file,
      dataOverride: file,
    });

    //  Intercept projects route
    networkActions.mockPaginatedNetworkReq({
      ...API_ROUTES.projectList,
      resDataOverride: {
        results: mirageServer
          .createRecordList('project', 1)
          .map((prj) => ({ ...prj, file: file.id })),
      },
    });

    //  Return empty submissions data
    networkActions.mockPaginatedNetworkReq({
      route: API_ROUTES.submissionList.route,
      alias: 'submissionList',
      resDataOverride: {
        results: [],
      },
    });

    // Logs user to dashboard via API
    loginActions.loginWithCredAndSaveSession({ username, password });

    cy.visit('/');

    // Navigates to project listing route
    cy.url({ timeout: 15000 }).should('include', APPLICATION_ROUTES.projects);

    // Necessary API call before showing dashboard elements
    cy.wait('@submissionList', { timeout: 15000 });

    // Programmatically check for page elements based on user information.
    cy.wait('@userInfoRoute').then(({ response }) => {
      const orgUser = response?.body?.data?.attributes as Partial<
        MirageFactoryDefProps['user']
      >;

      const username = orgUser?.username;

      // Programmatically check for user name in navbar
      if (username) {
        cy.findByText(username).should('exist');
      }
    });

    loginActions.verifyDashboardElements();
  });

  it('should redirect authenticated user to dashboard after logging in via SSO', () => {
    // Logs user to dashboard via API
    loginActions.loginWithSSOAndSaveSession({ username });

    cy.visit('/');

    // Navigates to project listing route
    cy.url({ timeout: 15000 }).should('include', APPLICATION_ROUTES.projects);

    // Necessary API call before showing dashboard elements
    cy.wait('@submissionList', { timeout: 15000 });

    // Programmatically check for page elements based on user information.
    cy.wait('@userInfoRoute').then(({ response }) => {
      const orgUser = response?.body?.data?.attributes as Partial<
        MirageFactoryDefProps['user']
      >;

      const username = orgUser?.username;

      // Programmatically check for user name in navbar
      if (username) {
        cy.findByText(username).should('exist');
      }
    });

    loginActions.verifyDashboardElements();
  });
});
