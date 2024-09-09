import cyTranslate from '../support/translations';

import LoginActions from '../support/Actions/auth/LoginActions';
import NetworkActions from '../support/Actions/common/NetworkActions';
import ServiceAccountActions from '../support/Actions/common/ServiceAccountActions';

import { API_ROUTES } from '../support/api.routes';
import { APPLICATION_ROUTES } from '../support/application.routes';

import dayjs from 'dayjs';

// Grouped test Actions
const loginActions = new LoginActions();
const networkActions = new NetworkActions();
const serviceAccountActions = new ServiceAccountActions();

// User credentials
const username = Cypress.env('TEST_USERNAME');
const password = Cypress.env('TEST_PASSWORD');
const API_HOST = Cypress.env('API_HOST');

const NETWORK_WAIT_OPTS = {
  timeout: 60000,
};

// Id's to test
const duplicateId =
  Cypress.env('SERVICE_ACCOUNT_DUPLICATE_ACCOUNT_ID') || '141';
const viewId = Cypress.env('SERVICE_ACCOUNT_VIEW_ACCOUNT_ID') || '132';

// Creation types and their details
const SERVICE_ACCOUNT_CREATION_TYPE_DETAILS = [
  {
    type: 'with expiry',
    name: 'Test with expiry',
    description: 'Test description with expiry',
    expiry: true,
    allProjects: true,
    expiryDays: '25',
    projectName: '',
  },
  {
    type: 'without expiry',
    name: 'Test without expiry',
    description: 'Test description without expiry',
    expiry: false,
    allProjects: true,
    expiryDays: '',
    projectName: '',
  },
  {
    type: 'with expiry for some projects',
    name: 'Test with expiry for some projects',
    description: 'Test description with expiry for some projects',
    expiry: true,
    allProjects: false,
    expiryDays: '5',
    projectName: 'com.appknox.mfva',
  },
];

// fixes cross origin errors
Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from failing the test
  return false;
});

describe('Service Account', () => {
  beforeEach(() => {
    networkActions.hideNetworkLogsFor({ ...API_ROUTES.websockets });

    // Used for clean up in afterEach
    cy.wrap(false).as('testCompleted');

    //Change when service account is created
    cy.wrap(null).as('serviceAccountId');

    // Login or restore session
    loginActions.loginWithCredAndSaveSession({ username, password });

    // Network interceptions
    cy.intercept(API_ROUTES.serviceAccountList.route).as('serviceAccountList');
    cy.intercept(API_ROUTES.projectList.route).as('orgProjectList');

    // Intercept the DELETE request for service accounts
    cy.intercept('DELETE', API_ROUTES.serviceAccount.route).as(
      'serviceAccountDelete'
    );

    // Intercept the PUT request for service accounts
    cy.intercept('PUT', API_ROUTES.serviceAccount.route).as(
      'serviceAccountUpdate'
    );

    // Intercept the POST request for service accounts
    cy.intercept('POST', API_ROUTES.serviceAccountList.route).as(
      'serviceAccountCreate'
    );

    //visit Service Account
    cy.visit(APPLICATION_ROUTES.serviceAccount);

    // Necessary API call before showing elements
    cy.wait('@serviceAccountList', NETWORK_WAIT_OPTS);
  });

  SERVICE_ACCOUNT_CREATION_TYPE_DETAILS.forEach((app) =>
    it(`should create service account ${app.type} & delete it`, function () {
      //click create service account button
      cy.findByTestId('serviceAccountList-createBtn')
        .as('CreateSAButton')
        .should('exist');

      cy.get('@CreateSAButton').click();

      //check if create page is open
      cy.findByText(cyTranslate('serviceAccountModule.createTitle')).should(
        'exist'
      );

      //fill in name for service account
      serviceAccountActions.editNameInput(app.name, false);

      //fill in description for service account
      cy.findByTestId('serviceAccountSection-accountOverview-descriptionInput')
        .as('SADescriptionInput')
        .should('not.have.attr', 'disabled');

      cy.get('@SADescriptionInput')
        .type(app.description, { delay: 0 })
        .then(($input) => {
          expect($input.val()).to.equal(app.description);
        });

      //fill in expiry date for service account
      if (app.expiry) {
        cy.findByTestId('serviceAccountSection-accessToken-expiryInDaysInput')
          .as('SAExpriyInput')
          .should('not.have.attr', 'disabled');

        cy.get('@SAExpriyInput')
          .clear() //This is to clear input default value goes to 1
          .clear() //This is to clear 1 and make input empty
          .type(app.expiryDays, { delay: 0 })
          .then(($input) => {
            expect($input.val()).to.equal(app.expiryDays);
          });
      } else {
        //click does not expire
        cy.findByTestId(
          'serviceAccountSection-accessToken-doesNotExpireCheckbox'
        )
          .as('SAExpiryCheckbox')
          .should('not.have.attr', 'disabled');

        cy.get('@SAExpiryCheckbox').check();
      }

      //when only specific project need to be selected
      if (!app.allProjects) {
        //click on dropdown to select specific project
        serviceAccountActions.selectProjectType(
          cyTranslate('serviceAccountModule.forSpecificProjects')
        );

        //click on add project for service account
        cy.findByTestId(
          'serviceAccountSection-selectProjectList-emptyAddProjectBtn'
        )
          .should('exist')
          .click();

        cy.findByTestId('serviceAccountAddProjectList-addBtn')
          .as('SAProjectAddButton')
          .should('exist');

        //add button should be disable when no project is selected
        cy.get('@SAProjectAddButton').should('have.attr', 'disabled');

        //wait fot search result to appear
        cy.wait('@orgProjectList', NETWORK_WAIT_OPTS);

        //search of particular project
        cy.findByPlaceholderText(cyTranslate('searchProject')).type(
          app.projectName
        );

        //wait fot search result to appear
        cy.wait('@orgProjectList', NETWORK_WAIT_OPTS);

        cy.findByTestId('serviceAccountAddProjectList-thead').should('exist');

        //check particular project
        cy.findByTestId('serviceAccountAddProjectList-row')
          .find('input[type="checkbox"]')
          .as('SAProjectListChecbox')
          .check();

        cy.get('@SAProjectListChecbox').check();

        //add project in service account
        cy.get('@SAProjectAddButton').click();
      }

      serviceAccountActions.saveServiceAccount();

      //wait for service account to create
      cy.wait('@serviceAccountCreate', NETWORK_WAIT_OPTS)
        .its('response.body.id')
        .then((id: number) => {
          cy.wrap(id).as('serviceAccountId');
        });

      //success message should be appeared
      serviceAccountActions.checkSuccessMessage(
        cyTranslate('serviceAccountModule.createSuccessMsg')
      );

      //it should land on view project page
      cy.findByText(cyTranslate('serviceAccountModule.detailsTitle')).should(
        'exist'
      );

      //name should match
      cy.findByTestId('serviceAccountSection-accountOverview-nameValue')
        .invoke('text')
        .then((text) => text.trim())
        .should('equal', app.name);

      //description should match
      cy.findByTestId('serviceAccountSection-accountOverview-descriptionValue')
        .invoke('text')
        .then((text) => text.trim())
        .should('equal', app.description);

      //copy secret key button should exist initially
      cy.findByTestId(
        'serviceAccountSection-accessToken-secretKeyCopyBtn'
      ).should('exist');

      //expiry value should be particular date or no expiry should be shown
      cy.findByTestId('serviceaccountsection-accesstoken-expiryvalue')
        .invoke('text')
        .then((text) => text.trim())
        .as('SAExpiryValue');

      if (app.expiry) {
        const today = dayjs();

        const expectedDate = today
          .add(parseInt(app.expiryDays), 'day')
          .format('MMM DD, YYYY');

        cy.get('@SAExpiryValue').should('equal', expectedDate);
      } else {
        cy.get('@SAExpiryValue').should('equal', cyTranslate('noExpiry'));
      }

      if (app.allProjects) {
        //select project list should not exist when all project are selected
        serviceAccountActions.assertProjectListContainerState('not.exist');
      } else {
        //select project list should exist when specific project are selected
        serviceAccountActions.assertProjectListContainerState('exist');

        //particular project should be shown
        cy.findByTestId('serviceAccountSection-selectProjectList-projectName')
          .invoke('text')
          .then((text) => text.trim())
          .should('equal', app.projectName);
      }

      //delete service account
      serviceAccountActions.deleteServiceAccount();

      //wait for delete of service account
      cy.wait('@serviceAccountDelete', NETWORK_WAIT_OPTS);

      //success delete message should be appeared
      serviceAccountActions.checkSuccessMessage(
        cyTranslate('serviceAccountModule.deleteSuccessMsg')
      );

      //change when all scenarios are completed
      cy.wrap(true).as('testCompleted');
    })
  );

  it(`should create duplicate and edit`, function () {
    //click view more option button on table
    cy.findByTestId(`serviceAccountList-row-${duplicateId}`).within(() => {
      cy.findByTestId('serviceAccountList-moreOptionBtn').click();
    });

    //click on duplicate option
    cy.findByText('Duplicate').should('exist').click();

    //fill in name for duplicate account
    serviceAccountActions.editNameInput(
      ' Duplicate',
      false,
      'Cypress Test Duplicate'
    );

    //click on save service account button
    serviceAccountActions.saveServiceAccount();

    //wait for service account to get create
    cy.wait('@serviceAccountCreate', NETWORK_WAIT_OPTS)
      .its('response.body.id')
      .then((id: number) => {
        cy.wrap(id).as('serviceAccountId');
      });

    //success message should be appeared
    serviceAccountActions.checkSuccessMessage(
      cyTranslate('serviceAccountModule.createSuccessMsg')
    );

    //click on edit overview button
    serviceAccountActions.clickEditOverviewButton();

    //re-edit name for service account
    serviceAccountActions.editNameInput('Try Duplicate', true);

    //click on update overview button
    serviceAccountActions.clickUpdateOverviewButton();

    cy.wait('@serviceAccountUpdate', NETWORK_WAIT_OPTS);

    //success message should be appeared
    serviceAccountActions.checkSuccessMessage(
      cyTranslate('serviceAccountModule.editSuccessMsg')
    );

    //check selected scope checked and unchecked length
    cy.findAllByTestId(
      'serviceAccountSection-selectScope-nodeLabelIcon-checked'
    ).should('have.length', 1);

    cy.findAllByTestId(
      'serviceAccountSection-selectScope-nodeLabelIcon-unchecked'
    ).should('have.length', 3);

    //click on edit scope button
    cy.findByTestId('serviceAccountSection-selectScope-actionBtn')
      .as('EditScopeButton')
      .should('exist');

    cy.get('@EditScopeButton').click();

    //click on parent checkbox to select all
    cy.findByTestId('checkbox-tree-nodeKey-public-api').within(() => {
      cy.get('[data-test-checkbox]').click();
    });

    //click on update select scope button
    cy.findByTestId('serviceAccountSection-selectScope-updateBtn')
      .as('UpdateScopeButton')
      .should('exist');

    cy.get('@UpdateScopeButton').click();

    cy.wait('@serviceAccountUpdate', NETWORK_WAIT_OPTS);

    //success message should be appeared
    serviceAccountActions.checkSuccessMessage(
      cyTranslate('serviceAccountModule.editSuccessMsg')
    );

    //check if all scope are checked
    cy.findAllByTestId(
      'serviceAccountSection-selectScope-nodeLabelIcon-checked'
    ).should('have.length', 4);

    //no uncheck should be present
    cy.findAllByTestId(
      'serviceAccountSection-selectScope-nodeLabelIcon-unchecked'
    ).should('not.exist');

    //select project list should exist when specific project are selected
    serviceAccountActions.assertProjectListContainerState('exist');

    //clcik on edit project button
    cy.findByTestId('serviceAccountSection-selectProject-actionBtn')
      .as('EditProjectButton')
      .should('exist');

    cy.get('@EditProjectButton').click();

    //click on dropdown to select all project
    serviceAccountActions.selectProjectType(cyTranslate('allProjects'));

    //click on update project button
    cy.findByTestId('serviceAccountSection-selectProject-updateBtn')
      .as('UpdateProjectButton')
      .should('exist');

    cy.get('@UpdateProjectButton').click();

    cy.wait('@serviceAccountUpdate', NETWORK_WAIT_OPTS);

    //success message should be appeared
    serviceAccountActions.checkSuccessMessage(
      cyTranslate('serviceAccountModule.editSuccessMsg')
    );

    //select project list should not exist when all project are selected
    serviceAccountActions.assertProjectListContainerState('not.exist');

    //delete service account
    serviceAccountActions.deleteServiceAccount();

    cy.wait('@serviceAccountDelete', NETWORK_WAIT_OPTS);

    //success delete message should be appeared
    serviceAccountActions.checkSuccessMessage(
      cyTranslate('serviceAccountModule.deleteSuccessMsg')
    );

    //change when all scenarios are completed
    cy.wrap(true).as('testCompleted');
  });

  it(`should check table, view and edit description`, function () {
    //check position of particular service accoun
    cy.findByTestId('serviceAccountList-table')
      .find('tr')
      .last()
      .should('have.attr', 'data-test-cy', `serviceAccountList-row-${viewId}`);

    //click on view service account button from table
    cy.findByTestId(`serviceAccountList-row-${viewId}`).within(() => {
      cy.findByTestId('serviceAccountList-viewDetailsLink').click();
    });

    //click on edit overview button
    serviceAccountActions.clickEditOverviewButton();

    //fill in description for service account
    cy.findByTestId('serviceAccountSection-accountOverview-descriptionInput')
      .as('SADescriptionInput')
      .should('not.have.attr', 'disabled');

    cy.get('@SADescriptionInput').clear().type(dayjs().format(), { delay: 0 });

    //click on update overview button
    serviceAccountActions.clickUpdateOverviewButton();

    cy.wait('@serviceAccountUpdate', NETWORK_WAIT_OPTS);

    //success message should be appeared
    serviceAccountActions.checkSuccessMessage(
      cyTranslate('serviceAccountModule.editSuccessMsg')
    );

    //click on service account breadcrumb to go back
    cy.findByTestId('serviceAccountDetails-breadcrumbItem-Service Account')
      .as('ServiceAccountBreadcrumb')
      .should('exist');

    cy.get('@ServiceAccountBreadcrumb').click();

    //position of particular service account should not change after edit
    cy.findByTestId('serviceAccountList-table')
      .find('tr')
      .last()
      .should('have.attr', 'data-test-cy', `serviceAccountList-row-${viewId}`);

    cy.wrap(true).as('testCompleted');
  });

  afterEach(() => {
    // Delete service account if test fails
    cy.get<boolean>('@testCompleted').then((testCompleted) => {
      if (!testCompleted) {
        cy.getAliases(['@serviceAccountId']).then(([id]) => {
          if (id) {
            //only of account is created
            cy.makeAuthenticatedAPIRequest({
              method: 'DELETE',
              url: `${API_HOST}/api/service_accounts/${id}/`,
              body: { all: true },
            });
          }
        });
      }
    });
  });
});
