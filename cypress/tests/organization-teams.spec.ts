import cyTranslate from '../support/translations';

import LoginActions from '../support/Actions/auth/LoginActions';
import NetworkActions from '../support/Actions/common/NetworkActions';

import { API_ROUTES } from '../support/api.routes';
import { APPLICATION_ROUTES } from '../support/application.routes';
import { type MirageFactoryDefProps } from '../support/Mirage';

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
  teamName: 'cypress-org-team-test-team',
  newTeamName: 'cypress-new-team',
  projectName: 'com.appknox.mfva',
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

describe('Organization Teams', () => {
  beforeEach(() => {
    networkActions.hideNetworkLogsFor({ ...API_ROUTES.websockets });

    cy.intercept(API_ROUTES.userInfo.route).as('userInfoRoute');
    cy.intercept(API_ROUTES.submissionList.route).as('submissionList');
    cy.intercept(API_ROUTES.teamsList.route).as('teamsList');
    cy.intercept(API_ROUTES.projectList.route).as('projectList');
    cy.intercept(API_ROUTES.organization.route).as('organization');
    cy.intercept(API_ROUTES.organizationTeams.route).as('organizationTeams');
    cy.intercept(API_ROUTES.usersList.route).as('usersList');
    cy.intercept(API_ROUTES.teamProject.route).as('teamProject');
    cy.intercept(API_ROUTES.teamMembersList.route).as('teamMembersList');
    cy.intercept('GET', API_ROUTES.inviteTeam.route).as('getInviteTeam');
    cy.intercept('POST', API_ROUTES.inviteTeam.route).as('postInviteTeam');
    cy.intercept('PUT', API_ROUTES.teamMembers.route).as('teamMember');

    loginActions.loginWithCredAndSaveSession({ ...AUTH_USER });

    // Visit Organization Teams page
    cy.visit(APPLICATION_ROUTES.organizationTeams);

    cy.wrap(false).as('shouldRunAfterEach');

    // Wait for relevant network responses
    cy.wait('@submissionList', NETWORK_WAIT_OPTS);
    cy.wait('@userInfoRoute', NETWORK_WAIT_OPTS);
    cy.wait('@teamsList', NETWORK_WAIT_OPTS);

    // wait for page to load
    cy.findAllByTestId('org-team-overview').should(
      'be.visible',
      ELEMENT_WAIT_OPTS
    );
  });

  it(
    'should search team in teams list',
    { retries: { runMode: 1 } },
    function () {
      // used for clean up in afterEach
      cy.wrap(false).as('testCompleted');

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

      cy.wrap(true).as('testCompleted');
    }
  );

  it('should create/delete new team', { retries: { runMode: 1 } }, function () {
    // used for clean up in afterEach
    cy.wrap(true).as('shouldRunAfterEach');

    cy.wrap(false).as('testCompleted');

    cy.wrap({
      perform: () => {
        cy.getAliases(['@teamId', '@orgId']).then(([teamId, orgId]) => {
          // Make the API request to delete the team
          cy.makeAuthenticatedAPIRequest({
            method: 'DELETE',
            url: `${API_HOST}/api/organizations/${orgId}/teams/${teamId}`,
          });
        });
      },
    }).as('testCleanup');

    // Click the create new team button
    cy.findByText(cyTranslate('createTeam')).as('newTeamBtn').should('exist');

    cy.get('@newTeamBtn').click();

    // Ensure the team name input exists
    cy.findByPlaceholderText(cyTranslate('teamName'))
      .as('teamNameInput')
      .should('exist');

    // Enter the team name
    cy.get('@teamNameInput').type(TEST_DATA.newTeamName);

    // Submit the form
    cy.findByTestId('create-team-submit-btn').should('exist').click();

    cy.wait('@teamsList', NETWORK_WAIT_OPTS).then((interception) => {
      // Check successful status code
      expect(interception.response?.statusCode).to.eq(201);

      // save the team id and org id
      cy.wrap(interception.response?.body?.id).as('teamId');
      cy.wrap(interception.response?.body?.organization).as('orgId');
    });

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

    cy.findByTestId('ak-modal-body').within(() => {
      cy.get('button[data-test-confirmbox-confirmbtn]').click();
    });

    // Wait for success message
    cy.findByText(
      `${TEST_DATA.newTeamName} ${cyTranslate('teamDeleted')}`,
      ELEMENT_WAIT_OPTS
    ).should('exist');

    // Verify that the team was deleted
    cy.get('@newTeam').should('not.exist');

    cy.wrap(true).as('testCompleted');
  });

  it(
    'should add/remove project to team',
    { retries: { runMode: 1 } },
    function () {
      // used for clean up in afterEach
      cy.wrap(true).as('shouldRunAfterEach');

      cy.wrap(false).as('testCompleted');

      cy.wrap({
        perform: () => {
          cy.getAliases(['@teamId', '@orgId', '@projectId']).then(
            ([teamId, orgId, projectId]) => {
              // Make the API request to delete the team
              cy.makeAuthenticatedAPIRequest({
                method: 'DELETE',
                url: `${API_HOST}/api/organizations/${orgId}/teams/${teamId}/projects/${projectId}`,
              });
            }
          );
        },
      }).as('testCleanup');

      // Verify that the team was created
      cy.findAllByTestId('org-team-overview-name', ELEMENT_WAIT_OPTS)
        .contains(TEST_DATA.teamName)
        .should('exist')
        .as('cypressTeam');

      // Open drawer
      cy.get('@cypressTeam').click();

      // Add project to team
      cy.findByText(cyTranslate('addProject')).click();

      cy.wait('@projectList', NETWORK_WAIT_OPTS)
        .its('response.body')
        .its('results')
        .then((data: Array<MirageFactoryDefProps['project']>) => {
          // Select first project to reduce flakiness
          cy.wrap(data[0] ?? null).as('selectedProject');
        });

      cy.get<MirageFactoryDefProps['project']>('@selectedProject').then(
        (project) => {
          cy.findAllByTestId('addProjectList-row')
            .filter(':contains(' + project?.package_name + ')')
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

          cy.wait('@teamProject', NETWORK_WAIT_OPTS).then((interception) => {
            // Store `projectId` for cleanup
            cy.wrap(interception.response?.body?.id).as('projectId');
          });

          cy.wait('@organizationTeams', NETWORK_WAIT_OPTS).then(
            (interception) => {
              // Store `teamId` and `orgId` for cleanup
              cy.wrap(interception.response?.body?.id).as('teamId');

              cy.wrap(interception.response?.body?.organization).as('orgId');
            }
          );

          cy.findByText(
            cyTranslate('teamProjectAdded'),
            ELEMENT_WAIT_OPTS
          ).should('exist');

          cy.get('[data-test-teamdetailaction-titlebtn]').click();

          cy.get('tr', ELEMENT_WAIT_OPTS)
            .filter(':contains(' + project?.package_name + ')')
            .should('exist')
            .as('addedProjectRow');
        }
      );

      cy.get('@addedProjectRow').within(() => {
        cy.get('[data-test-teamProjectList-actionBtn]').click();
      });

      cy.findByTestId('ak-modal-body').within(() => {
        cy.get('button[data-test-confirmbox-confirmbtn]').click();
      });

      cy.wait('@organizationTeams', NETWORK_WAIT_OPTS);

      cy.findByText(cyTranslate('projectRemoved'), ELEMENT_WAIT_OPTS).should(
        'exist'
      );

      cy.findByTestId('teamDetail-closeBtn').click();

      cy.wrap(true).as('testCompleted');
    }
  );

  it(
    'should add/remove user to team',
    { retries: { runMode: 1 } },
    function () {
      // used for clean up in afterEach
      cy.wrap(true).as('shouldRunAfterEach');

      cy.wrap(false).as('testCompleted');

      cy.wrap({
        perform: () => {
          cy.getAliases(['@teamId', '@orgId', '@userId']).then(
            ([teamId, orgId, userId]) => {
              // Make the API request to delete the team
              cy.makeAuthenticatedAPIRequest({
                method: 'DELETE',
                url: `${API_HOST}/api/organizations/${orgId}/teams/${teamId}/members/${userId}`,
              });
            }
          );
        },
      }).as('testCleanup');

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

      cy.wait('@teamMember', NETWORK_WAIT_OPTS).then((interception) => {
        // Store `userId` for cleanup
        cy.wrap(interception.response?.body?.id).as('userId');
      });

      cy.wait('@organizationTeams', NETWORK_WAIT_OPTS).then((interception) => {
        // Store `teamId` and `orgId` for cleanup
        cy.wrap(interception.response?.body?.id).as('teamId');

        cy.wrap(interception.response?.body?.organization).as('orgId');
      });

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

      cy.findByTestId('ak-modal-body').within(() => {
        cy.findByLabelText(
          cyTranslate('promptBox.removeMemberPrompt.description')
        ).type(TEST_DATA.testUser.username);

        cy.get('button[data-test-confirmbox-confirmbtn]').click();
      });

      cy.wait('@organizationTeams', NETWORK_WAIT_OPTS);

      cy.findByText(cyTranslate('teamMemberRemoved'), ELEMENT_WAIT_OPTS).should(
        'exist'
      );

      cy.findByTestId('teamDetail-closeBtn').click();

      cy.wrap(true).as('testCompleted');
    }
  );

  it('should invite user to team', { retries: { runMode: 1 } }, function () {
    // used for clean up in afterEach
    cy.wrap(true).as('shouldRunAfterEach');

    cy.wrap(false).as('testCompleted');

    cy.wrap({
      perform: () => {
        cy.getAliases(['@teamId', '@orgId', '@inviteId']).then(
          ([teamId, orgId, inviteId]) => {
            // Make the API request to delete the team
            cy.makeAuthenticatedAPIRequest({
              method: 'DELETE',
              url: `${API_HOST}/api/organizations/${orgId}/teams/${teamId}/invitations/${inviteId}`,
            });
          }
        );
      },
    }).as('testCleanup');

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

    cy.wait('@postInviteTeam', NETWORK_WAIT_OPTS).then((interception) => {
      // Store for cleanup
      cy.wrap(interception.response?.body?.id).as('inviteId');
      cy.wrap(interception.response?.body?.team).as('teamId');
      cy.wrap(interception.response?.body?.organization).as('orgId');
    });

    cy.wait('@getInviteTeam', NETWORK_WAIT_OPTS);

    cy.findByText(cyTranslate('orgMemberInvited'), ELEMENT_WAIT_OPTS).should(
      'exist'
    );

    cy.wait('@teamMembersList', NETWORK_WAIT_OPTS);

    // Delete invitation
    cy.findAllByTestId('invite-list-row', ELEMENT_WAIT_OPTS)
      .filter(':contains(' + TEST_DATA.testUser.inviteEmail + ')')
      .should('exist')
      .as('invitedUserRow');

    cy.get('@invitedUserRow').within(() => {
      cy.get('[data-test-invitation-delete-btn]').click();
    });

    cy.findByTestId('ak-modal-body').within(() => {
      cy.get('button[data-test-confirmbox-confirmbtn]').click();
    });

    cy.findByText(cyTranslate('invitationDeleted'), ELEMENT_WAIT_OPTS).should(
      'exist'
    );

    cy.wait('@getInviteTeam', NETWORK_WAIT_OPTS);

    cy.findByTestId('teamDetail-closeBtn').click();

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
