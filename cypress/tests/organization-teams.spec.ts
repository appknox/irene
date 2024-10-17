import cyTranslate from '../support/translations';

import LoginActions from '../support/Actions/auth/LoginActions';
import NetworkActions from '../support/Actions/common/NetworkActions';

import { API_ROUTES } from '../support/api.routes';
import { APPLICATION_ROUTES } from '../support/application.routes';

// Grouped test Actions
const loginActions = new LoginActions();
const networkActions = new NetworkActions();

// Authentication credentials
const AUTH_USER = {
  username: Cypress.env('TEST_USERNAME'),
  password: Cypress.env('TEST_PASSWORD'),
};

// Test data
const TEST_DATA = {
  testUser: {
    username: 'cypress2',
    inviteEmail: 'cypress2+1@appknox.io',
  },
  teamName: 'cypress-org-user-test-team',
  newTeamName: 'cypress-new-team',
  projectName: 'com.appknox.mfva',
};

const NETWORK_WAIT_OPTS = {
  timeout: 60000,
};

const ELEMENT_WAIT_OPTS = { timeout: 10000 };

// fixes cross origin errors
Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from failing the test
  return false;
});

describe('Organization Teams', () => {
  beforeEach(() => {
    networkActions.hideNetworkLogsFor({ ...API_ROUTES.websockets });

    cy.intercept(API_ROUTES.userInfo.route).as('userInfoRoute');
    cy.intercept(API_ROUTES.submissionList.route).as('submissionList');
    cy.intercept(API_ROUTES.teamsList.route).as('teamList');
    cy.intercept(API_ROUTES.projectList.route).as('projectList');
    cy.intercept(API_ROUTES.organization.route).as('organization');
    cy.intercept(API_ROUTES.editTeam.route).as('editTeam');
    cy.intercept(API_ROUTES.usersList.route).as('usersList');
    cy.intercept(API_ROUTES.inviteTeam.route).as('inviteTeam');

    loginActions.loginWithCredAndSaveSession({
      username: AUTH_USER.username,
      password: AUTH_USER.password,
    });

    // Visit Organization Teams page
    cy.visit(APPLICATION_ROUTES.organizationTeams);

    // Wait for relevant network responses
    cy.wait('@submissionList', NETWORK_WAIT_OPTS);
    cy.wait('@userInfoRoute', NETWORK_WAIT_OPTS);
    cy.wait('@teamList', NETWORK_WAIT_OPTS);

    // wait for page to load
    cy.findAllByTestId('org-team-overview').should(
      'be.visible',
      ELEMENT_WAIT_OPTS
    );
  });

  it(`should search team in teams list`, function () {
    // Ensure the search input exists
    cy.findByPlaceholderText(cyTranslate('searchTeam'))
      .as('searchInput')
      .should('exist');

    // Search for the team
    cy.get('@searchInput').type(TEST_DATA.teamName);

    // Verify that the team was found
    cy.get('@searchInput').should('have.value', TEST_DATA.teamName);

    cy.findByTestId('org-team-overview-name', ELEMENT_WAIT_OPTS).should(
      'contain.text',
      TEST_DATA.teamName
    );

    // Clear the search input
    cy.get('@searchInput').clear();

    // Verify the input is cleared
    cy.get('@searchInput').should('have.value', '');
  });

  it('should create/delete new team', function () {
    // Ensure the create new team button exists
    cy.findByText(cyTranslate('createTeam')).as('newTeamBtn').should('exist');

    // Click the create new team button
    cy.get('@newTeamBtn').click();

    // Ensure the team name input exists
    cy.findByPlaceholderText(cyTranslate('teamName'))
      .as('teamNameInput')
      .should('exist');

    // Enter the team name
    cy.get('@teamNameInput').type(TEST_DATA.newTeamName);

    // Submit the form
    cy.findByTestId('create-team-submit-btn').should('exist').click();

    cy.wait('@organization', NETWORK_WAIT_OPTS);

    // Wait for success message
    cy.findByText(cyTranslate('teamCreated'), ELEMENT_WAIT_OPTS).should(
      'exist'
    );

    // Verify that the team was created
    cy.findAllByTestId('org-team-overview-name', ELEMENT_WAIT_OPTS)
      .contains(TEST_DATA.newTeamName)
      .should('exist')
      .as('newTeam');

    // Open drawer
    cy.get('@newTeam').click();

    // Delete the team
    cy.findByText(cyTranslate('deleteTeam')).click();

    cy.findByLabelText(
      cyTranslate('promptBox.deleteTeamPrompt.description')
    ).type(TEST_DATA.newTeamName);

    cy.get('.ember-modal-dialog').within(() => {
      cy.findByText(cyTranslate('deleteTeam')).click();
    });

    // Verify that the team was deleted
    cy.get('@newTeam').should('not.exist');

    cy.wait('@organization', NETWORK_WAIT_OPTS);
  });

  it('should add/remove project to team', function () {
    // Verify that the team was created
    cy.findAllByTestId('org-team-overview-name', ELEMENT_WAIT_OPTS)
      .contains(TEST_DATA.teamName)
      .should('exist')
      .as('cypressTeam');

    // Open drawer
    cy.get('@cypressTeam').click();

    // Add project to team
    cy.findByText(cyTranslate('addProject')).click();

    cy.wait('@projectList', NETWORK_WAIT_OPTS);

    cy.findAllByTestId('addProjectList-row')
      .filter(':contains(' + TEST_DATA.projectName + ')')
      .should('exist')
      .as('projectRow');

    // Find the checkbox within this row and check it
    cy.get('@projectRow').within(() => {
      cy.get('[data-test-checkbox]').check().should('be.checked');
    });

    cy.get('[data-test-teamDetailAction-actionBtn]')
      .contains(cyTranslate('addProject'))
      .should('exist')
      .click();

    cy.wait('@editTeam', NETWORK_WAIT_OPTS);

    cy.findByText(cyTranslate('teamProjectAdded'), ELEMENT_WAIT_OPTS).should(
      'exist'
    );

    cy.get('[data-test-teamdetailaction-titlebtn]').click();

    // Remove project from team
    cy.get('tr', ELEMENT_WAIT_OPTS)
      .filter(':contains(' + TEST_DATA.projectName + ')')
      .should('exist')
      .as('addedProjectRow');

    cy.get('@addedProjectRow').within(() => {
      cy.get('[data-test-teamProjectList-actionBtn]').click();
    });

    cy.get('.ember-modal-dialog').within(() => {
      cy.get('button[data-test-confirmbox-confirmbtn]').click();
    });

    cy.wait('@editTeam', NETWORK_WAIT_OPTS);

    cy.findByText(cyTranslate('projectRemoved'), ELEMENT_WAIT_OPTS).should(
      'exist'
    );

    cy.findByTestId('teamDetail-closeBtn').click();
  });

  it('should add/remove user to team', function () {
    // Add user to team using add user action
    cy.findAllByTestId('org-team-overview-name', ELEMENT_WAIT_OPTS)
      .contains(TEST_DATA.teamName)
      .should('exist')
      .as('cypressTeam');

    // Open drawer
    cy.get('@cypressTeam').click();

    // Add user to team
    cy.findByText(cyTranslate('addUser')).click();

    cy.wait('@usersList', NETWORK_WAIT_OPTS);

    cy.findAllByTestId('userList-row')
      .filter(':contains(' + TEST_DATA.testUser.username + ')')
      .should('exist')
      .as('userRow');

    // Find the checkbox within this row and check it
    cy.get('@userRow').within(() => {
      cy.get('[data-test-checkbox]').check().should('be.checked');
    });

    cy.get('[data-test-teamdetailaction-actionbtn]')
      .contains(cyTranslate('addUsers'))
      .should('exist')
      .click();

    cy.wait('@editTeam', NETWORK_WAIT_OPTS);
    cy.wait('@usersList', NETWORK_WAIT_OPTS);

    cy.findByText(cyTranslate('teamMemberAdded'), ELEMENT_WAIT_OPTS).should(
      'exist'
    );

    cy.get('[data-test-teamdetailaction-titlebtn]').click();

    // Remove user from team
    cy.get('tr', ELEMENT_WAIT_OPTS)
      .filter(':contains(' + TEST_DATA.testUser.username + ')')
      .should('exist')
      .as('addedUserRow');

    cy.get('@addedUserRow').within(() => {
      cy.get('[data-test-teamUserList-actionBtn]').click();
    });

    cy.get('.ember-modal-dialog').within(() => {
      cy.findByLabelText(
        cyTranslate('promptBox.removeMemberPrompt.description')
      ).type(TEST_DATA.testUser.username);

      cy.get('button[data-test-confirmbox-confirmbtn]').click();
    });

    cy.wait('@editTeam', NETWORK_WAIT_OPTS);

    cy.findByText(cyTranslate('teamMemberRemoved'), ELEMENT_WAIT_OPTS).should(
      'exist'
    );

    cy.findByTestId('teamDetail-closeBtn').click();
  });

  it('should invite user to team', function () {
    cy.findAllByTestId('org-team-overview-name', ELEMENT_WAIT_OPTS)
      .contains(TEST_DATA.teamName)
      .should('exist')
      .as('cypressTeam');

    // Open drawer
    cy.get('@cypressTeam').click();

    // Invite user to team
    cy.findByText(cyTranslate('inviteUsers')).click();

    cy.findByPlaceholderText(cyTranslate('email')).type(
      TEST_DATA.testUser.inviteEmail
    );

    cy.findByText(cyTranslate('invite')).click();

    cy.wait('@inviteTeam', NETWORK_WAIT_OPTS);

    cy.findByText(cyTranslate('orgMemberInvited'), ELEMENT_WAIT_OPTS).should(
      'exist'
    );

    // Delete invitation
    cy.findAllByTestId('invitationList-row', ELEMENT_WAIT_OPTS)
      .filter(':contains(' + TEST_DATA.testUser.inviteEmail + ')')
      .should('exist')
      .as('invitedUserRow');

    cy.get('@invitedUserRow').within(() => {
      cy.get('[data-test-invitation-delete-btn]').click();
    });

    cy.get('.ember-modal-dialog').within(() => {
      cy.get('button[data-test-confirmbox-confirmbtn]').click();
    });

    cy.findByText(cyTranslate('invitationDeleted'), ELEMENT_WAIT_OPTS).should(
      'exist'
    );

    cy.wait('@inviteTeam', NETWORK_WAIT_OPTS);

    cy.findByTestId('teamDetail-closeBtn').click();
  });
});
