import cyTranslate from '../support/translations';
import { MirageFactoryDefProps } from '../support/Mirage';

import LoginActions from '../support/Actions/auth/LoginActions';
import NetworkActions from '../support/Actions/common/NetworkActions';
import UploadAppActions from '../support/Actions/common/UploadAppActions';

import { API_ROUTES } from '../support/api.routes';
import { APPLICATION_ROUTES } from '../support/application.routes';

// Grouped test Actions
const loginActions = new LoginActions();
const networkActions = new NetworkActions();
const uploadAppActions = new UploadAppActions();

// User credentials
const username = Cypress.env('TEST_USERNAME');
const password = Cypress.env('TEST_PASSWORD');

const playStoreUrl =
  'https://play.google.com/store/apps/details?id=com.afwsamples.testdpc&hl=en&gl=US&pli=1';

// Example application types and their fixture locations
const APP_DETAILS = [
  { type: 'apk', fixture: 'MFVA.apk' },
  { type: 'aab', fixture: 'MFVA.aab' },
  { type: 'ipa', fixture: 'DVIA.ipa' },
  { type: 'apk', url: playStoreUrl },
];

// Assertion Timeout Overrides
const DEFAULT_ASSERT_OPTS = {
  timeout: 120000,
};

const NETWORK_WAIT_OPTS = {
  timeout: 60000,
};

const SUBMISSION_WAIT_OPTS = {
  timeout: 160000,
};

// fixes cross origin errors
Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Test body
describe('Upload App', () => {
  beforeEach(() => {
    // Hide websocket and analyses logs
    networkActions.hideNetworkLogsFor({ ...API_ROUTES.websockets });
    networkActions.hideNetworkLogsFor({
      route: `${API_ROUTES.analysis.route}/*`,
    });

    /* TODO: Remove or retain this interception based on whether
     * access to submissions API is restricted or not.
     * -------------------------------------------------
     * Necessary to intercept submission requests that were returning 404
     * This was causing the submission adapters to fail
     */
    networkActions
      .interceptParameterizedRoute<{ subId: string }>({
        route: '/api/submissions/:subId',
        routeHandler: async (req, params) => {
          req.continue((res) => {
            if (res.statusCode === 404) {
              res.send({
                statusCode: 200,
                body: {
                  id: params.subId,
                  status: 7,
                },
              });
            }
          });
        },
      })
      .as('submissionReq');

    // Login or restore session
    loginActions.loginWithCredAndSaveSession({ username, password });

    // Network interceptions
    cy.intercept(API_ROUTES.check.route).as('checkUserRoute');
    cy.intercept(API_ROUTES.userInfo.route).as('userInfoRoute');
    cy.intercept(API_ROUTES.projectList.route).as('orgProjectList');
    cy.intercept(API_ROUTES.submissionList.route).as('submissionList');
    cy.intercept(API_ROUTES.sbomProjectList.route).as('sbomProjectList');

    cy.intercept('GET', API_ROUTES.uploadApp.route).as('uploadAppReq');
    cy.intercept('POST', API_ROUTES.uploadApp.route).as('uploadAppReqPOST');

    cy.intercept('POST', API_ROUTES.uploadAppViaLink.route).as(
      'uploadAppLinkReqPOST'
    );
  });

  APP_DETAILS.forEach((appType) =>
    it(
      `It successfully uploads an ${appType.type} file ${appType.url ? '(via link)' : ''}`,
      { retries: { runMode: 2 } },
      function () {
        // Visit projects page
        cy.visit(APPLICATION_ROUTES.projects);

        // Necessary API call before showing dashboard elements
        cy.wait('@submissionList', NETWORK_WAIT_OPTS);

        cy.findByText(cyTranslate('startNewScan')).should('exist');

        if (appType.url) {
          uploadAppActions.initiateViaLinkUpload(appType.url);
        } else if (appType.fixture) {
          uploadAppActions.initiateViaSystemUpload(appType.fixture);
        }

        // Wait for uploaded file submission status to show in status popover
        cy.get<number>('@uploadedAppSubID').then((id) =>
          cy
            .findByTestId(
              `upload-app-status-details-${id}`,
              DEFAULT_ASSERT_OPTS
            )
            .within(() => {
              if (appType.url) {
                cy.contains(cyTranslate('viaLink'));
              }

              // App details sometimes do not return the created file until after second/third upload submission response
              // This function waits for the response four times to capture the returned file appropraitely
              function waitForAppSubFileResolution(attempts = 0) {
                if (attempts === 7) {
                  return;
                }

                cy.wait(
                  '@uploadedAppSubmission',
                  appType.url ? SUBMISSION_WAIT_OPTS : NETWORK_WAIT_OPTS
                ).then(async ({ response: res }) => {
                  const submission =
                    res?.body as MirageFactoryDefProps['submission'];

                  const storeURLValidationFails = submission.status === 10102;

                  if (storeURLValidationFails) {
                    throw new Error(
                      `TEST FAILURE REASON: "${submission.status_humanized}"`
                    );
                  }

                  if (!submission.file) {
                    waitForAppSubFileResolution(++attempts);

                    return;
                  }

                  const appDetails = submission.app_data;
                  const fileID = submission.file;

                  // Intercept created file for application binary
                  const uploadedFileURL = `${API_ROUTES.file.route}/${fileID}`;

                  cy.intercept('GET', uploadedFileURL).as('uploadedAppFile');

                  cy.wrap(submission?.package_name).as(
                    'uploadedAppPackageName'
                  );

                  if (appDetails) {
                    cy.findAllByText(
                      appDetails?.package_name,
                      DEFAULT_ASSERT_OPTS
                    );

                    cy.findAllByText(appDetails?.name, DEFAULT_ASSERT_OPTS);
                  }

                  // If file is not being analyzed
                  if (submission?.status !== 7) {
                    cy.contains(
                      new RegExp(submission?.status_humanized, 'i'),
                      DEFAULT_ASSERT_OPTS
                    );
                  }
                });
              }

              waitForAppSubFileResolution();
            })
        );

        // Closes upload app modal
        uploadAppActions.closeUploadAppModalIfOpen();

        // Waits for uploaded file app response to return
        // and wait for its project card to appear in the project listing page
        cy.wait('@uploadedAppFile', NETWORK_WAIT_OPTS).then(
          ({ response: res }) => {
            const file = res?.body as MirageFactoryDefProps['file'];

            // Save file for later assertions
            cy.wrap(file).as('uploadedFileDetails');
            cy.wrap(file.project).as('uploadedAppPrjID');

            cy.findByTestId(`project-overview-${file.id}`, NETWORK_WAIT_OPTS)
              .should('exist')
              .within(() => {
                // File info should show in the project card
                cy.findByText(file?.id).should('exist');
                cy.findByText(file?.name).should('exist');

                cy.findByTestId('fileOverview-version').within(() =>
                  cy.findByText(file?.version).should('exist')
                );

                cy.findByTestId('fileOverview-versionCode').within(() =>
                  cy.findByText(file?.version_code).should('exist')
                );
              });
          }
        );

        // Click project associated with uploaded file
        cy.get<MirageFactoryDefProps['file']>('@uploadedFileDetails')
          .its('id')
          .then((prjID) =>
            cy
              .findByTestId(`project-overview-${prjID}`, DEFAULT_ASSERT_OPTS)
              .click({ force: true })
          );

        // Check if in file page
        cy.url().should('contain', APPLICATION_ROUTES.file);

        cy.wait('@uploadedAppFile', NETWORK_WAIT_OPTS).then((int) => {
          const file = int?.response?.body as MirageFactoryDefProps['file'];

          // File details check
          cy.findByAltText(`${file.name} - logo`).should('exist');
          cy.get('@uploadedAppPackageName').should('exist');
          cy.get('@uploadedFileDetails').its('id').should('exist');
          cy.get('@uploadedFileDetails').its('name').should('exist');

          uploadAppActions.checkStaticScanInfo(file);
        });

        // Go to SBOM Page
        cy.findByLabelText(`${cyTranslate('SBOM')} side menu item`).click();

        // Check if route is SBOM Page
        cy.url().should('contain', APPLICATION_ROUTES.sbom);

        cy.findByText(cyTranslate('sbomModule.sbomAppTitle')).should('exist');

        cy.findByText(cyTranslate('sbomModule.sbomAppDescription')).should(
          'exist'
        );

        uploadAppActions.assertFileIsInSBOMProjectList(
          '@sbomProjectList',
          '@uploadedAppPrjID',
          '@uploadedFileDetails',
          '@uploadedAppPackageName'
        );
      }
    )
  );

  it(
    'App upload fails if org plan has insufficient upload credits',
    { retries: { runMode: 2 } },
    function () {
      // Visit projects page
      cy.visit(APPLICATION_ROUTES.projects);

      // Necessary API call before showing dashboard elements
      cy.wait('@submissionList', NETWORK_WAIT_OPTS);

      cy.findByText(cyTranslate('startNewScan')).should('exist');

      // Initiate apk upload from fixture
      // Using `readFile` to avoid caching issues (https://github.com/cypress-io/cypress/discussions/29069)
      cy.readFile('cypress/fixtures/apps/MFVA.apk', null).as('apkApplication');

      // Test APK file upload via system
      uploadAppActions.selectAppViaSystem('@apkApplication');

      // Initiate apk upload
      cy.wait('@uploadAppReq').then(({ response: res }) => {
        const uploadDetails = res?.body as MirageFactoryDefProps['upload-app'];

        cy.intercept('PUT', uploadDetails.url).as('uploadSuccess');

        uploadAppActions.openUploadAppModal();

        cy.findByText(cyTranslate('viaSystem')).should('exist');
        cy.findByText(cyTranslate('uploadStatus')).should('exist');

        cy.findByText(new RegExp(cyTranslate('uploading'), 'i')).should(
          'exist'
        );
      });

      // Wait for upload completion
      cy.wait('@uploadSuccess', NETWORK_WAIT_OPTS);

      // Intercepts uploaded file submission request from uploaded file info
      cy.wait('@uploadAppReqPOST', NETWORK_WAIT_OPTS).then(
        ({ response: res }) => {
          const uploadDetails =
            res?.body as MirageFactoryDefProps['upload-app'];

          const uploadedAppSubURL = `${API_ROUTES.submissionItem.route}/${uploadDetails.submission_id}`;

          cy.findByText(cyTranslate('fileUploadedSuccessfully'));

          // Intercept upload app submission request and return a failed scenario
          networkActions.mockNetworkReq({
            alias: 'uploadedAppSubmission',
            route: uploadedAppSubURL,
            dataOverride: {
              id: uploadDetails.submission_id,
              file: null,
              reason: 'Please upgrade your plan to start making new scans',
              status: 5,
              package_name: 'com.example.mfva',
              url: '',
              source: 0,
              status_humanized: 'Failed to validate the file',
              app_data: null,
            },
          });
        }
      );

      // Waits for upload app submission response
      cy.wait('@uploadedAppSubmission', NETWORK_WAIT_OPTS).then(
        ({ response: res }) => {
          // App details do not return until after second upload submission request
          const submission = res?.body as MirageFactoryDefProps['submission'];
          const appDetails = submission?.app_data;

          if (appDetails) {
            cy.findAllByText(appDetails.package_name).should('exist');
            cy.findAllByText(appDetails.name).should('exist');
          }

          // If file is not being analyzed
          if (submission.status !== 7) {
            cy.findByText(new RegExp(submission.reason, 'i')).should('exist');

            cy.findByText(new RegExp(submission.status_humanized, 'i')).should(
              'exist'
            );
          }
        }
      );
    }
  );
});
