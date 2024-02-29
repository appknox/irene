import APP_TRANSLATIONS from '../support/translations';
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

// Example application types and their fixture locations
const APP_TYPES = {
  apk: 'MFVA.apk',
  aab: 'MFVA.aab',
  ipa: 'DVIA',
};

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
    cy.intercept(API_ROUTES.uploadApp.route).as('uploadAppReq');
    cy.intercept(API_ROUTES.projectList.route).as('orgProjectList');
    cy.intercept(API_ROUTES.submissionList.route).as('submissionList');
    cy.intercept(API_ROUTES.sbomProjectList.route).as('sbomProjectList');
    cy.intercept('POST', API_ROUTES.uploadApp.route).as('uploadAppReqPOST');
  });

  Object.keys(APP_TYPES).forEach((app) =>
    it(
      `It successfully uploads an ${app} binary file`,
      { retries: { runMode: 1, openMode: 1 } },
      function () {
        // Visit projects page
        cy.visit(APPLICATION_ROUTES.projects);

        // Necessary API call before showing dashboard elements
        cy.wait('@submissionList', { timeout: 40000 });

        cy.findByText(APP_TRANSLATIONS.startNewScan).should('exist');

        // Initiate apk upload from fixture
        const appName = APP_TYPES[app as keyof typeof APP_TYPES];

        cy.fixture(`apps/${appName}`, null).as('appBinary');
        uploadAppActions.selectAppViaSystem('@appBinary');

        // Initiate apk upload
        cy.wait('@uploadAppReq').then(({ response: res }) => {
          const uploadDetails =
            res?.body as MirageFactoryDefProps['upload-app'];

          // Necessary to know when upload is completed
          cy.intercept('PUT', uploadDetails.url).as('uploadSuccess');

          uploadAppActions.openUploadAppModal();

          cy.findByText(APP_TRANSLATIONS.viaSystem).first().should('exist');
          cy.findByText(APP_TRANSLATIONS.uploadStatus).first().should('exist');

          cy.findByText(new RegExp(APP_TRANSLATIONS.uploading, 'i')).should(
            'exist'
          );
        });

        // Wait for upload completion
        cy.wait('@uploadSuccess', { timeout: 60000 });

        // Intercepts uploaded file submission request from uploaded file info
        cy.wait('@uploadAppReqPOST', { timeout: 60000 }).then(
          ({ response: res }) => {
            const uploadDetails =
              res?.body as MirageFactoryDefProps['upload-app'];

            const uploadedAppSubURL = `${API_ROUTES.submissionItem.route}/${uploadDetails.submission_id}`;

            cy.findByText(APP_TRANSLATIONS.fileUploadedSuccessfully);

            // Intercept upload app submission request
            cy.intercept('GET', uploadedAppSubURL).as('uploadedAppSubmission');
          }
        );

        // Waits for upload app submission response
        cy.wait(['@uploadedAppSubmission', '@uploadedAppSubmission'], {
          timeout: 60000,
        }).then(([int1, int2]) => {
          // App details do not return until after second upload submission request
          const submission = {
            ...int1?.response?.body,
            ...int2?.response?.body,
          } as MirageFactoryDefProps['submission'] & { file: string };

          const appDetails = submission?.app_data;

          if (appDetails) {
            cy.findAllByText(appDetails.package_name).should('exist');
            cy.findAllByText(appDetails.name).should('exist');
          }

          // If file is not being analyzed
          if (submission.status !== 7) {
            cy.findByText(new RegExp(submission.status_humanized, 'i')).should(
              'exist'
            );
          }

          // Intercept created file for application (.apk) binary
          const uploadedFileURL = `${API_ROUTES.file.route}/${submission?.file}`;
          cy.intercept('GET', uploadedFileURL).as('uploadedAppFile');
        });

        // Wait for ptoject list refresh
        uploadAppActions
          .waitForProjectListRefresh('@orgProjectList')
          .then((projectList) => {
            // The project of the uploaded file should be the first project
            const firstProject = projectList.results?.[0];

            cy.wrap(firstProject?.package_name).as('packageName');
            cy.wrap(firstProject?.id).as('uploadedAppPrjID');
          });

        // Waits for uploaded file app response to return
        cy.wait('@uploadedAppFile', {
          timeout: 60000,
        }).then(({ response: res }) => {
          const file = res?.body as MirageFactoryDefProps['file'];

          // Save file for later assertions
          cy.wrap(file).as('uploadedFileDetails');

          cy.get<number>('@uploadedAppPrjID').then((prjID) => {
            cy.findByTestId(`project-overview-${prjID}`)
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
          });
        });

        // Closes upload app modal
        uploadAppActions.closeUploadAppModalIfOpen();

        // Click project associated with uploaded file
        cy.get<number>('@uploadedAppPrjID').then((prjID) => {
          cy.findByTestId(`project-overview-${prjID}`).should('exist').click();
        });

        // Check if in file page
        cy.url().should('contain', APPLICATION_ROUTES.file);

        // Wait for file response in file page
        cy.wait('@uploadedAppFile').then(({ response: res }) => {
          const file = res?.body as MirageFactoryDefProps['file'];

          // File details check
          cy.findAllByAltText(`${file.name} - logo`).should('exist');
          cy.get('@packageName').should('exist');
          cy.get('@uploadedFileDetails').its('id').should('exist');
          cy.get('@uploadedFileDetails').its('name').should('exist');

          cy.findByTestId('staticScan-infoContainer').then((el) => {
            const assertOpts = { container: el };

            cy.findByText(APP_TRANSLATIONS.staticScan, assertOpts).should(
              'exist'
            );

            // Check if static scan has completed or is in progress
            if (file.is_static_done) {
              cy.findByText(APP_TRANSLATIONS.completed, assertOpts).should(
                'exist'
              );

              // Check for severity count if static scan is completed
              cy.findByTestId('fileChart-severityLevelCounts').within(() => {
                // If static scan is complete counts are stable
                cy.findAllByText(file.risk_count_high).should('exist');
                cy.findAllByText(file.risk_count_medium).should('exist');
                cy.findAllByText(file.risk_count_low).should('exist');
                cy.findAllByText(file.risk_count_critical).should('exist');
                cy.findAllByText(file.risk_count_passed).should('exist');
              });
            } else {
              cy.wrap(file.static_scan_progress).should('be.lessThan', 100);

              cy.findByText(
                new RegExp(APP_TRANSLATIONS.scanning, 'i'),
                assertOpts
              ).should('exist');
            }
          });

          // Check for completed/incomplete static scan tag in VA Details list
          cy.findAllByLabelText(`${APP_TRANSLATIONS.static} scan tag tooltip`)
            .first()
            .should('exist')
            .then((scanTag) => {
              if (scanTag) {
                const tagMsg = file.is_static_done
                  ? APP_TRANSLATIONS.scanCompleted
                  : APP_TRANSLATIONS.scanNotCompleted;

                cy.wrap(scanTag).trigger('mouseenter');

                cy.findByText(`${APP_TRANSLATIONS.static} ${tagMsg}`);
              }
            });
        });

        // Go to SBOM Page
        cy.findByLabelText(`${APP_TRANSLATIONS.SBOM} side menu item`).click();

        // Check if route is SBOM Page
        cy.url().should('contain', APPLICATION_ROUTES.sbom);

        cy.findByText(APP_TRANSLATIONS.sbomModule.sbomAppTitle).should('exist');

        cy.findByText(APP_TRANSLATIONS.sbomModule.sbomAppDescription).should(
          'exist'
        );

        // Allow SBOM project list to load
        cy.wait('@sbomProjectList', { timeout: 60000 }).then(
          ({ response: res }) => {
            const sbomPrjListRes = res?.body as {
              results: Array<MirageFactoryDefProps['sbom-project']>;
            };

            cy.get<number>('@uploadedAppPrjID').then((prjID) => {
              const sbomProject = sbomPrjListRes.results.find(
                (it) => it.project === prjID
              );

              const sbomPrjFileID = sbomProject?.latest_sb_file;

              // To be used for later assertions
              cy.wrap(sbomProject).as('uploadedAppSBPrj');

              if (sbomPrjFileID) {
                const sbFileURL = `${API_ROUTES.sbom.route}/${sbomPrjFileID}`;

                cy.intercept(sbFileURL).as('uploadedAppSBFileReq');
              }
            });
          }
        );

        // Wait for SB File response
        cy.wait('@uploadedAppSBFileReq', { timeout: 60000 }).then(
          ({ response: res }) => {
            const sbFile = res?.body as MirageFactoryDefProps['sbom-file'];

            const SB_FILE_STATUS = {
              1: 'PENDING',
              2: 'IN_PROGRESS',
              3: 'COMPLETED',
              4: 'FAILED',
            };

            const sbFileStatus =
              SB_FILE_STATUS[sbFile.status as keyof typeof SB_FILE_STATUS];

            // Sanity Check for related sbom project row
            cy.get<MirageFactoryDefProps['sbom-project']>(
              '@uploadedAppSBPrj'
            ).then((prj) => {
              cy.findByTestId(`sbomApp-row-${prj?.id}`)
                .should('exist')
                .within(() => {
                  // Check if correct file details are visible
                  cy.findByText(sbFileStatus);
                  cy.get('@uploadedFileDetails').its('name').should('exist');
                  cy.get('@packageName').should('exist');
                });
            });
          }
        );
      }
    )
  );

  it(
    'App upload fails if org plan has insufficient upload credits',
    { retries: { runMode: 1, openMode: 1 } },
    function () {
      // Visit projects page
      cy.visit(APPLICATION_ROUTES.projects);

      // Necessary API call before showing dashboard elements
      cy.wait('@submissionList', { timeout: 40000 });

      cy.findByText(APP_TRANSLATIONS.startNewScan).should('exist');

      // Initiate apk upload from fixture
      cy.fixture('apps/MFVA.apk', null).as('apkApplication');

      uploadAppActions.selectAppViaSystem('@apkApplication');

      // Initiate apk upload
      cy.wait('@uploadAppReq').then(({ response: res }) => {
        const uploadDetails = res?.body as MirageFactoryDefProps['upload-app'];

        cy.intercept('PUT', uploadDetails.url).as('uploadSuccess');

        uploadAppActions.openUploadAppModal();

        cy.findByText(APP_TRANSLATIONS.viaSystem).should('exist');
        cy.findByText(APP_TRANSLATIONS.uploadStatus).should('exist');

        cy.findByText(new RegExp(APP_TRANSLATIONS.uploading, 'i')).should(
          'exist'
        );
      });

      // Wait for upload completion
      cy.wait('@uploadSuccess', { timeout: 60000 });

      // Intercepts uploaded file submission request from uploaded file info
      cy.wait('@uploadAppReqPOST', { timeout: 60000 }).then(
        ({ response: res }) => {
          const uploadDetails =
            res?.body as MirageFactoryDefProps['upload-app'];

          const uploadedAppSubURL = `${API_ROUTES.submissionItem.route}/${uploadDetails.submission_id}`;

          cy.findByText(APP_TRANSLATIONS.fileUploadedSuccessfully);

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
      cy.wait('@uploadedAppSubmission', {
        timeout: 60000,
      }).then(({ response: res }) => {
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
      });
    }
  );
});
