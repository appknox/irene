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

const API_HOST = Cypress.env('API_HOST');

// Test data
const TEST_DATA = {
  testUser: {
    username: 'cypress2',
    inviteEmail: 'cypress2+1@appknox.io',
  },
  teamName: 'cypress-org-user-test-team',
};

const NETWORK_WAIT_OPTS = {
  timeout: 60000,
};

const ELEMENT_WAIT_OPTS = { timeout: 10000 };

interface Cleanup {
  perform: () => void;
}

// fixes cross origin errors
Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from failing the test
  return false;
});

describe('Organization Users', () => {
  beforeEach(() => {
    networkActions.hideNetworkLogsFor({ ...API_ROUTES.websockets });

    cy.intercept(API_ROUTES.userInfo.route).as('userInfoRoute');
    cy.intercept(API_ROUTES.submissionList.route).as('submissionList');
    cy.intercept(API_ROUTES.membersList.route).as('membersList');
    cy.intercept(API_ROUTES.teamMembers.route).as('teamMembers');
    cy.intercept(API_ROUTES.inviteUser.route).as('inviteUser');
    cy.intercept(API_ROUTES.teamExcludesUser.route).as('teamExcludesUser');
    cy.intercept(API_ROUTES.teamIncludesUser.route).as('teamIncludesUser');
    cy.intercept('PUT', API_ROUTES.member.route).as('memberReq');
    cy.intercept('PUT', API_ROUTES.editUserInfo.route).as('editUser');

    loginActions.loginWithCredAndSaveSession({ ...AUTH_USER });

    // Visit Organization Users page
    cy.visit(APPLICATION_ROUTES.organizationUsers);

    cy.wrap(false).as('shouldRunAfterEach');

    cy.wrap(4050).as('orgId');

    // Wait for relevant network responses
    cy.wait('@submissionList', NETWORK_WAIT_OPTS);
    cy.wait('@userInfoRoute', NETWORK_WAIT_OPTS);

    // wait for page to load
    cy.findByTestId('org-user-table')
      .should('be.visible', ELEMENT_WAIT_OPTS)
      .as('orgUserTable');
  });

  it('should change user roles', function () {
    // used for clean up in afterEach
    cy.wrap(true).as('shouldRunAfterEach');

    cy.wrap(false).as('testCompleted');

    cy.wrap({
      perform: () => {
        cy.getAliases(['@userId', '@orgId']).then(([userId, orgId]) => {
          // Make the API request to reactivate the user
          cy.makeAuthenticatedAPIRequest({
            method: 'PUT',
            url: `${API_HOST}/api/organizations/${orgId}/members/${userId}`,
            body: { role: 1 },
          });
        });
      },
    }).as('testCleanup');

    cy.get('@orgUserTable')
      .find('tr')
      .filter(':contains(' + TEST_DATA.testUser.username + ')')
      .as('userRow');

    // Change user role within the row
    cy.get('@userRow').within(() => {
      cy.findByTestId('user-role-select', ELEMENT_WAIT_OPTS)
        .as('userRoleSelect')
        .should('exist');

      // Click the role dropdown to show options
      cy.get('@userRoleSelect').click();
    });

    // Select and verify role "Admin"
    cy.findByRole('option', { name: 'Admin' }).should('exist').click();

    // Verify that the role has been changed to "Admin"
    cy.get('@userRoleSelect').should('contain.text', 'Admin');

    cy.wait('@memberReq', NETWORK_WAIT_OPTS).then((interception) => {
      expect(interception.response?.body?.role_display).to.eq('Admin');
      const userId = interception.response?.body?.member;

      cy.wrap(userId).as('userId');

      // Assert that the response contains the updated role "Admin"
      expect(interception.response?.statusCode).to.eq(200);
    });

    // Verify the success message for role update
    cy.findByText(cyTranslate('userRoleUpdated'), NETWORK_WAIT_OPTS).should(
      'exist'
    );

    // Change user role back to "Owner"
    cy.get('@userRow').within(() => {
      cy.findByTestId('user-role-select', ELEMENT_WAIT_OPTS)
        .as('userRoleSelect')
        .should('exist');

      // Click the role dropdown to show options
      cy.get('@userRoleSelect').click();
    });

    cy.findByRole('option', { name: 'Owner' }).should('exist').click();

    // Verify that the role has been changed to "Owner"
    cy.get('@userRoleSelect').should('contain.text', 'Owner');

    cy.wait('@memberReq').then((interception) => {
      // Assert that the response contains the updated role "Owner"
      expect(interception.response?.statusCode).to.eq(200);

      expect(interception.response?.body?.role_display).to.eq('Owner');
    });

    // Verify the final success message for role update
    cy.findByText(cyTranslate('userRoleUpdated'), NETWORK_WAIT_OPTS).should(
      'exist'
    );

    cy.wrap(true).as('testCompleted');
  });

  it('should search user in users list', function () {
    // Ensure the search input exists
    cy.findByPlaceholderText(cyTranslate('searchUser'))
      .as('searchInput')
      .should('exist');

    // Search for the user
    cy.get('@searchInput').type(TEST_DATA.testUser.username);

    // Verify that the user was found
    cy.get('@searchInput').should('have.value', TEST_DATA.testUser.username);

    // Find the user row containing the user
    cy.findByTestId('org-user-row', ELEMENT_WAIT_OPTS).within(() => {
      // Ensure the username exists within the row
      cy.findByText(TEST_DATA.testUser.username).should('exist');
    });

    // Clear the search input
    cy.get('@searchInput').clear();

    // Verify the input is cleared
    cy.get('@searchInput').should('have.value', '');
  });

  it('should invite user', function () {
    // used for clean up in afterEach
    cy.wrap(true).as('shouldRunAfterEach');

    cy.wrap(false).as('testCompleted');

    cy.wrap({
      perform: () => {
        cy.getAliases(['@orgId', '@invitationId']).then(
          ([orgId, invitationId]) => {
            // Make the API request to reactivate the user
            cy.makeAuthenticatedAPIRequest({
              method: 'DELETE',
              url: `${API_HOST}/api/organizations/${orgId}/invitations/${invitationId}`,
            });
          }
        );
      },
    }).as('testCleanup');

    // Find the invite button
    cy.findByText(cyTranslate('inviteUsers'))
      .as('inviteButton')
      .should('exist');

    // Click the invite button
    cy.get('@inviteButton').click();

    // Find email input box
    cy.findByPlaceholderText(cyTranslate('email'))
      .as('emailInput')
      .should('exist');

    // Enter email
    cy.get('@emailInput').type(TEST_DATA.testUser.inviteEmail);

    cy.get('@emailInput').should('have.value', TEST_DATA.testUser.inviteEmail);

    // Find invite button
    cy.findByText(cyTranslate('invite')).click();

    cy.wait('@inviteUser').then((interception) => {
      // Capture `invitationId` from the response
      const invitationId = interception.response?.body?.id;
      const orgId = interception.response?.body?.organization;

      // Store `invitationId` and `orgId` for cleanup
      cy.wrap(invitationId).as('invitationId');
      cy.wrap(orgId).as('orgId');
    });

    // Find success message
    cy.findByText(cyTranslate('orgMemberInvited'), ELEMENT_WAIT_OPTS).should(
      'exist'
    );

    // delete the invite
    cy.findAllByTestId('invite-list-row')
      .filter(`:contains(${TEST_DATA.testUser.inviteEmail})`)
      .within(() => {
        // Click the delete button inside the filtered row
        cy.findByTestId('invite-delete-btn').click();
      });

    cy.findByRole('button', { name: cyTranslate('delete') }).click();

    // Find success message
    cy.findByText(cyTranslate('invitationDeleted'), ELEMENT_WAIT_OPTS).should(
      'exist'
    );

    cy.wrap(true).as('testCompleted');
  });

  it('should add/remove user to team', function () {
    // used for clean up in afterEach
    cy.wrap(true).as('shouldRunAfterEach');

    cy.wrap(false).as('testCompleted');

    cy.wrap({
      perform: () => {
        cy.getAliases(['@userId', '@orgId', '@teamId']).then(
          ([userId, orgId, teamId]) => {
            // Make the API request to reactivate the user
            cy.makeAuthenticatedAPIRequest({
              method: 'DELETE',
              url: `${API_HOST}/api/organizations/${orgId}/teams/${teamId}/members/${userId}`,
            });
          }
        );
      },
    }).as('testCleanup');

    // Locate the user row by username
    cy.get('@orgUserTable')
      .find('tr')
      .filter(':contains(' + TEST_DATA.testUser.username + ')')
      .as('userRow');

    cy.get('@userRow').click();

    // Add user to team
    cy.findByText(cyTranslate('addToTeams')).click();

    cy.wait('@teamExcludesUser', NETWORK_WAIT_OPTS);

    // search team
    cy.findByPlaceholderText(cyTranslate('searchTeam')).as('searchInput');

    cy.get('@searchInput').type(TEST_DATA.teamName);

    cy.findByTestId('teamList-table', ELEMENT_WAIT_OPTS).as('teamListTable');

    cy.get('@teamListTable')
      .find('tr', ELEMENT_WAIT_OPTS)
      .filter(':contains(' + TEST_DATA.teamName + ')')
      .as('teamRow');

    cy.get('@teamRow').within(() => {
      // Find add to team button
      cy.findByTestId('add-to-team-btn').click();
    });

    cy.wait('@teamMembers', NETWORK_WAIT_OPTS).then((interception) => {
      // Capture `teamId` from the response
      const userId = interception.response?.body?.id;

      cy.wrap(userId).as('userId');
    });

    // Go back
    cy.findByTestId('add-to-team-back-btn').click();

    cy.findByTestId('teamList-table', ELEMENT_WAIT_OPTS)
      .should('exist')
      .as('teamListTable');

    // Remove user from team
    cy.get('@teamListTable')
      .find('tr', ELEMENT_WAIT_OPTS)
      .filter(':contains(' + TEST_DATA.teamName + ')')
      .as('teamRow');

    // used for clean up in afterEach
    cy.get('@teamIncludesUser')
      .its('response.body.results[0]')
      .then((team) => {
        const orgId = team.organization;
        const teamId = team.id;

        // Store `orgId` and `teamId` for later use
        cy.wrap(orgId).as('orgId');
        cy.wrap(teamId).as('teamId');
      });

    cy.get('@teamRow').within(() => {
      // Find remove from team button
      cy.findByTestId('remove-user').should('exist').click();
    });

    cy.findByRole('button', { name: 'Remove' }).click();

    cy.wait('@teamMembers', NETWORK_WAIT_OPTS);

    cy.wait('@teamExcludesUser', NETWORK_WAIT_OPTS);

    cy.get('@teamListTable', ELEMENT_WAIT_OPTS).should('not.exist');

    cy.findByTestId('member-drawer-close-btn').click();

    cy.wrap(true).as('testCompleted');
  });

  it('should deactivate and activate user', function () {
    // used for clean up in afterEach
    cy.wrap(true).as('shouldRunAfterEach');

    cy.wrap(false).as('testCompleted');

    cy.wrap({
      perform: () => {
        cy.getAliases(['@userId', '@orgId']).then(([userId, orgId]) => {
          // Make the API request to reactivate the user
          cy.makeAuthenticatedAPIRequest({
            method: 'PUT',
            url: `${API_HOST}/api/organizations/${orgId}/users/${userId}`,
            body: { is_active: true },
          });
        });
      },
    }).as('testCleanup');

    // Locate the user row by username
    cy.get('@orgUserTable')
      .find('tr')
      .filter(`:contains(${TEST_DATA.testUser.username})`)
      .as('userRow');

    // Click the user row to open details
    cy.get('@userRow').click();

    // Deactivate the user
    cy.findByText(cyTranslate('deactivateUser')).click();
    cy.findByText(cyTranslate('confirm')).click();

    // Wait for the user edit action to complete
    cy.wait('@editUser', NETWORK_WAIT_OPTS).then((interception) => {
      expect(interception.response?.body?.is_active).to.eq(false);

      expect(interception.response?.statusCode).to.eq(200);

      // Store `userId` for cleanup
      cy.wrap(interception.response?.body?.id).as('userId');
    });

    // Close the modal after deactivating the user
    cy.findByTestId('member-drawer-close-btn').click();

    // Enable viewing inactive members
    cy.findByLabelText(cyTranslate('includeInactiveMembers')).check();

    cy.wait('@membersList', NETWORK_WAIT_OPTS);

    cy.findByTestId('org-user-table', ELEMENT_WAIT_OPTS).as('orgUserTable');

    // Locate the inactive user row by username
    cy.get('@orgUserTable', ELEMENT_WAIT_OPTS)
      .find('tr')
      .filter(`:contains(${TEST_DATA.testUser.username})`)
      .as('inactiveUserRow');

    // Verify that the user is now inactive
    cy.get('@inactiveUserRow', ELEMENT_WAIT_OPTS).within(() => {
      cy.findByText(cyTranslate('chipStatus.inactive')).should('exist');
    });

    // Click the inactive user row to activate the user
    cy.get('@inactiveUserRow').click();

    // // Activate the user
    cy.findByText(cyTranslate('activateUser')).click();
    cy.findByText(cyTranslate('confirm')).click();

    // Wait for the user edit action to complete
    cy.wait('@editUser', NETWORK_WAIT_OPTS).then((interception) => {
      expect(interception.response?.body?.is_active).to.eq(true);

      expect(interception.response?.statusCode).to.eq(200);
    });

    // Close the modal after activation
    cy.findByTestId('member-drawer-close-btn').click();

    cy.wrap(true).as('testCompleted');
  });

  afterEach(function () {
    cy.get<boolean>('@shouldRunAfterEach').then((shouldRunAfterEach) => {
      if (shouldRunAfterEach) {
        cy.getAliases(['@testCompleted', '@testCleanup']).then(
          ([testCompleted, testCleanup]) => {
            if (!testCompleted) {
              // Call the cleanup function
              (testCleanup as Cleanup).perform();
            }
          }
        );
      }
    });
  });
});
