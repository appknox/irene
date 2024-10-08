import cyTranslate from '../support/translations';

import LoginActions from '../support/Actions/auth/LoginActions';
import NetworkActions from '../support/Actions/common/NetworkActions';

import { API_ROUTES } from '../support/api.routes';
import { APPLICATION_ROUTES } from '../support/application.routes';

// Grouped test Actions
const loginActions = new LoginActions();
const networkActions = new NetworkActions();

// User 1 login credentials
const username = Cypress.env('TEST_USERNAME');
const password = Cypress.env('TEST_PASSWORD');

// User 2 username
const username2 = 'cypress2';
const inviteEmail = 'cypress2+1@appknox.io';
const teamName = 'mfva';

const NETWORK_WAIT_OPTS = {
  timeout: 60000,
};

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
    cy.intercept(API_ROUTES.teamsList.route).as('teamList');

    loginActions.loginWithCredAndSaveSession({ username, password });

    // Visit Organization Users page
    cy.visit(APPLICATION_ROUTES.organizationUsers);

    // Wait for relevant network responses
    cy.wait('@submissionList', NETWORK_WAIT_OPTS);
    cy.wait('@userInfoRoute', NETWORK_WAIT_OPTS);

    // wait for screen to load
    cy.wait(5000);
  });

  it(`should change user roles`, function () {
    // Ensure the dropdown for role selection exists
    cy.findAllByTestId('user-role-select').as('userRoleSelect').should('exist');

    // Retrieve the currently selected role from the dropdown
    cy.get('@userRoleSelect')
      .eq(0)
      .invoke('text')
      .then((currentRole) => {
        // Trim the role text to avoid spaces
        const role = currentRole.trim();

        cy.get('@userRoleSelect').eq(0).click();

        if (role === 'Owner' || role === 'Member') {
          // If the current role is "Owner" or "Member", change it to "Admin"
          cy.document()
            .findByRole('option', { name: 'Admin' })
            .should('exist')
            .click({ force: true });

          // Verify the success message
          cy.document()
            .findByText(cyTranslate('userRoleUpdated'))
            .should('exist');

          // Verify that the role has been changed to "Admin"
          cy.get('@userRoleSelect').eq(0).should('contain.text', 'Admin');
        } else if (role === 'Admin') {
          // If the current role is "Admin", change it to "Owner"
          cy.document()
            .findByRole('option', { name: 'Owner' })
            .should('exist')
            .click({ force: true });

          // Verify the success message
          cy.document()
            .findByText(cyTranslate('userRoleUpdated'))
            .should('exist');

          //  Verify that the role has been changed to "Owner"
          cy.get('@userRoleSelect').eq(0).should('contain.text', 'Owner');
        }
      });

    // Verify the success message
    cy.document().findByText(cyTranslate('userRoleUpdated')).should('exist');
  });

  it(`should search user in users list`, function () {
    // Ensure the search input exists
    cy.findByPlaceholderText(cyTranslate('searchUser'))
      .as('searchInput')
      .should('exist');

    // Search for the user
    cy.get('@searchInput').type(username2);

    // Verify that the user was found
    cy.get('@searchInput').should('have.value', username2);

    // Verify that the user is in the list
    cy.findByTestId('org-user-row', { timeout: 10000 })
      .eq(0)
      .should('contain.text', username2);

    // Clear the search input
    cy.get('@searchInput').clear();

    // Verify the input is cleared
    cy.get('@searchInput').should('have.value', '');
  });

  it(`should deactivate and activate user`, function () {
    // Ensure the search input exists
    cy.findByPlaceholderText(cyTranslate('searchUser'))
      .as('searchInput')
      .should('exist');

    // Search for the user
    cy.get('@searchInput').type(username2);

    // Verify that the user was found
    cy.get('@searchInput').should('have.value', username2);

    // Verify that the user is in the list
    cy.findByTestId('org-user-row').eq(0).should('contain.text', username2);

    cy.findByTestId('org-user-row').eq(0).click();

    // Deactivate the user
    cy.findByText(cyTranslate('deactivateUser')).click();
    cy.findByText(cyTranslate('confirm')).click();

    // Close the modal
    cy.findByTestId('member-drawer-close-btn').click();

    cy.findByLabelText(cyTranslate('includeInactiveMembers')).check();

    // Ensure the dropdown for role selection exists
    cy.findAllByTestId('user-role-select').as('userRoleSelect').should('exist');

    cy.findByText(cyTranslate('chipStatus.inactive')).should('exist');

    // Open the modal again
    cy.findByTestId('org-user-row').eq(0).click();

    // Activate the user
    cy.findByText(cyTranslate('activateUser')).click();
    cy.findByText(cyTranslate('confirm')).click();

    // Close the modal
    cy.findByTestId('member-drawer-close-btn').click();

    // Clear the search input
    cy.get('@searchInput').clear();
  });

  it(`should invite user`, function () {
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
    cy.get('@emailInput').type(inviteEmail);

    cy.get('@emailInput').should('have.value', inviteEmail);

    // Find invite button
    cy.findByText(cyTranslate('invite')).click();

    // Find success message
    cy.findByText(cyTranslate('orgMemberInvited'), { timeout: 5000 }).should(
      'exist'
    );

    // delete the invite
    cy.findAllByTestId('invite-list-row')
      .filter(`:contains(${inviteEmail})`)
      .within(() => {
        // Click the delete button inside the filtered row
        cy.findByTestId('invite-delete-btn').click();
      });

    cy.findByRole('button', { name: cyTranslate('delete') }).click();

    // Find success message
    cy.findByText(cyTranslate('invitationDeleted'), { timeout: 5000 }).should(
      'exist'
    );
  });

  it(`should add/remove user to team`, function () {
    cy.findByTestId('org-user-table').within(() => {
      cy.get('tbody>tr').eq(0).click();
    });

    // Add user to team
    cy.findByText(cyTranslate('addToTeams')).click();

    // search team
    cy.findByPlaceholderText(cyTranslate('searchTeam')).as('searchInput');

    cy.get('@searchInput').type(teamName);

    // Find add to team button
    cy.findByTestId('add-to-team-btn').eq(0).click();

    cy.wait('@teamList', NETWORK_WAIT_OPTS);

    // Go back
    cy.findByTestId('add-to-team-back-btn').click();

    cy.findByTestId('teamList-table', { timeout: 5000 })
      .as('teamListTable')
      .should('exist');

    // Remove user from team
    cy.get('@teamListTable').within(() => {
      cy.get('tbody>tr').eq(0).contains(teamName);

      cy.findByTestId('remove-user').eq(0).should('exist').click();
    });

    cy.findByRole('button', { name: 'Remove' }).click();

    cy.wait('@teamList', NETWORK_WAIT_OPTS);

    cy.findByTestId('teamList-table').within(() => {
      cy.get('tbody>tr')
        .eq(0, { timeout: 5000 })
        .should('not.have.text', teamName);
    });

    cy.findByTestId('member-drawer-close-btn').click();
  });
});
