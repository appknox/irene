import APP_TRANSLATIONS from '../support/translations';
import { mirageServer } from '../support/Mirage';

import LoginActions from '../support/Actions/auth/LoginActions';
import NetworkActions from '../support/Actions/common/NetworkActions';
import NotificationRepository from '../support/Repositories/NotificationRepository';

import LOGIN_PAGE_LOCATORS from '../locators/pages/LoginPage';
import NAVBAR_LOCATORS from '../locators/common/Navbar';

import { API_ROUTES } from '../support/api.routes';
import { APPLICATION_ROUTES } from '../support/application.routes';

// Grouped test Actions
const loginActions = new LoginActions();
const networkActions = new NetworkActions();

// Common application repositories
const notifications = new NotificationRepository();

// User credentials
const username = Cypress.env('TEST_USERNAME');
const password = Cypress.env('TEST_PASSWORD');

describe('User Login', () => {
  beforeEach(() => {
    networkActions.hideNetworkLogsFor({ ...API_ROUTES.websockets });
  });

  it('should redirect unauthenticated user to login page', function () {
    cy.visit(APPLICATION_ROUTES.projects);

    cy.url().should('contain', APPLICATION_ROUTES.login);
    cy.get(LOGIN_PAGE_LOCATORS.loginTitle).should(
      'contain.text',
      APP_TRANSLATIONS.login
    );

    cy.get(LOGIN_PAGE_LOCATORS.orgImageLogo).should('be.visible');
    cy.get(LOGIN_PAGE_LOCATORS.loginTitle)
      .should('be.visible')
      .contains(APP_TRANSLATIONS.login);

    cy.get(LOGIN_PAGE_LOCATORS.usernameField).should('be.visible');
    cy.get(LOGIN_PAGE_LOCATORS.userCheckIconBtn).should('be.visible');
    // cy.get(LOGIN_PAGE_LOCATORS.regLink).should('be.visible');
  });

  it('should throw an error if user credentials are invalid', () => {
    const errorMessage = 'Unable to log in with provided credentials.';

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

    // Logs user to dashboard via UI
    // CASE: Invalid Password
    loginActions.doLoginWithUI({ username, password: 'password' });
    notifications.assertErrorMessage(errorMessage);

    // CASE: Invalid Username
    loginActions.doLoginWithUI({ username: 'username', password });
    notifications.assertErrorMessage(errorMessage);
  });

  it('should redirect authenticated user to dashboard after logging in', () => {
    //  Intercept vulnerabilities route
    networkActions.mockNetworkReq({
      ...API_ROUTES.vulnerabilityList,
      dataOverride: {
        data: mirageServer.createRecordList('vulnerability', 1).map((_) => ({
          id: _['id'],
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
    const file = mirageServer.createRecord('file');

    networkActions.mockNetworkReq({
      ...API_ROUTES.unknownAnalysisStatus,
      dataOverride: unknownAnalysisStatus,
    });

    //  Intercept file request
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
          .map((_) => ({ ..._, file: file['id'] })),
      },
    });

    //  Return empty submissions data
    networkActions.mockPaginatedNetworkReq({
      ...API_ROUTES.submissionList,
      resDataOverride: {
        results: [],
      },
    });

    networkActions.loadAppConfigWithMockData();

    cy.visit('/');

    // Logs user to dashboard via API
    loginActions.doLoginWithUI({ username, password });

    // Navigates to project listing route
    cy.url({ timeout: 15000 }).should('include', APPLICATION_ROUTES.projects);

    // Assertion for different dashboard elements
    cy.get(NAVBAR_LOCATORS.container);

    cy.get(NAVBAR_LOCATORS.startScanBtn).contains(
      APP_TRANSLATIONS.startNewScan
    );

    cy.get(NAVBAR_LOCATORS.profileBtn).contains(username);
  });
});
