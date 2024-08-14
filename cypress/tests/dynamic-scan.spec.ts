import DynamicScanActions, {
  AppInformation,
  AppInteraction,
  DEFAULT_ASSERT_OPTS,
  DYNAMIC_SCAN_STATUS_TIMEOUT,
  DYNAMIC_SCAN_STOP_BTN_ALIAS,
  NETWORK_WAIT_OPTS,
} from '../support/Actions/common/DynamicScanActions';

import LoginActions from '../support/Actions/auth/LoginActions';
import NetworkActions from '../support/Actions/common/NetworkActions';

import { API_ROUTES } from '../support/api.routes';
import { APPLICATION_ROUTES } from '../support/application.routes';
import { MirageFactoryDefProps } from '../support/Mirage';
import cyTranslate from '../support/translations';

// Grouped test Actions
const loginActions = new LoginActions();
const networkActions = new NetworkActions();
const dynamicScanActions = new DynamicScanActions();

// User credentials
const username = Cypress.env('TEST_USERNAME');
const password = Cypress.env('TEST_PASSWORD');

const MFVA_INTERACTIONS: AppInteraction[] = [
  {
    name: 'home_screen',
    snapshot: 'home_screen',
    clickCoordinates: null,
  },
  {
    name: 'open_webview',
    snapshot: 'open_webview',
    clickCoordinates: [152, 100],
    timeout: 6000,
  },
  {
    name: 'back_to_home_from_webview',
    snapshot: 'home_screen',
    clickCoordinates: [20, 35],
  },
  {
    name: 'app_info',
    snapshot: 'app_info_dialog',
    clickCoordinates: [244, 32],
  },
];

// manually override above incase of generating base images
const MFVA_CROPPED_INTERACTION_OVERRIDES: Partial<AppInteraction>[] = [
  {
    name: 'open_webview',
    clickCoordinates: [152, 90],
  },
  {
    name: 'app_info',
    clickCoordinates: [235, 32],
  },
];

const DVIA_INTERACTIONS: AppInteraction[] = [
  {
    name: 'home_screen',
    snapshot: 'home_screen',
    clickCoordinates: null,
  },
  {
    name: 'open_menu',
    snapshot: 'open_menu',
    clickCoordinates: [10, 23],
  },
  {
    name: 'goto_jailbreak_detection',
    snapshot: 'jailbreak_detection',
    clickCoordinates: [56, 142],
  },
  {
    name: 'click_jailbreak_test_1',
    snapshot: 'jailbreak_test_1_dialog',
    clickCoordinates: [110, 205],
  },
];

// Application types and their details
const APP_TYPE_DETAILS = [
  {
    type: 'apk',
    fileId: Cypress.env('DYNAMIC_SCAN_SYSTEM_APK_FILE_ID') as number,
    name: /mfva/i,
    snapshotPrefix: 'mfva',
    errorThreshold: 0.065,
    packageName: 'com.appknox.mfva',
    interactions: MFVA_INTERACTIONS,

    performInteraction: (
      interactions: AppInteraction[],
      appInfo: AppInformation
    ) =>
      dynamicScanActions.checkForCroppedScreenAndInteract(
        interactions,
        MFVA_CROPPED_INTERACTION_OVERRIDES,
        appInfo,
        'mfva_home_screen',
        [0.6, 0.5]
      ),
  },
  {
    type: 'ipa',
    fileId: Cypress.env('DYNAMIC_SCAN_SYSTEM_IPA_FILE_ID') as number,
    name: /dvia/i,
    snapshotPrefix: 'dvia',
    errorThreshold: 0.2,
    packageName: 'com.appknox.dvia',
    interactions: DVIA_INTERACTIONS,

    performInteraction: (
      interactions: AppInteraction[],
      appInfo: AppInformation
    ) => dynamicScanActions.interactWithApp(interactions, appInfo),
  },
];

const DynamicStatusTexts = [cyTranslate('deviceBooting')];

const ANY_DEVICE = 0;
const ANY_VERSION = '0';

// fixes cross origin errors
Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from failing the test
  return false;
});

describe('Dynamic Scan', () => {
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
    cy.intercept(API_ROUTES.submissionList.route).as('submissionList');
  });

  APP_TYPE_DETAILS.forEach((app) =>
    it(
      `it tests dynamic scan for an ${app.type} file: ${app.fileId}`,
      { scrollBehavior: false, retries: { runMode: 1 } },
      () => {
        // intercept file request
        cy.intercept(`${API_ROUTES.file.route}/${app.fileId}`).as(
          'currentFileRequest'
        );

        // Visit file page
        cy.visit(`${APPLICATION_ROUTES.file}/${app.fileId}`);

        // Necessary API call before showing dashboard elements
        cy.wait('@submissionList', NETWORK_WAIT_OPTS);
        cy.wait('@currentFileRequest', NETWORK_WAIT_OPTS);

        // Check if in file page
        cy.url().should('contain', `${APPLICATION_ROUTES.file}/${app.fileId}`);

        // verify app name
        cy.get('@currentFileRequest')
          .its('response.body')
          .as('currentFile')
          .its('name')
          .should('match', app.name);

        // do file page assertions
        cy.get<MirageFactoryDefProps['file']>('@currentFile').then((file) => {
          // sanity check
          dynamicScanActions.doFilePageSanityCheck(file, app);

          // intercept device preference route to check & change options
          cy.intercept(API_ROUTES.devicePreference.route).as(
            'devicePreferenceReq'
          );

          // check dynamic scan info
          cy.findByTestId(
            'dynamicScan-infoContainer',
            DEFAULT_ASSERT_OPTS
          ).within(() => {
            const assertOpts = { ...DEFAULT_ASSERT_OPTS };

            cy.findByText(cyTranslate('dynamicScan'), assertOpts).should(
              'exist'
            );

            if (file.is_dynamic_done) {
              cy.findByRole('button', {
                name: cyTranslate('completed'),
              }).should('exist');

              cy.findByTestId('dynamicScan-restartBtn')
                .should('exist')
                .as('startRestartdynamicScanBtn');
            } else {
              cy.findByRole('button', { name: cyTranslate('start') })
                .should('exist')
                .as('startRestartdynamicScanBtn');
            }
          });

          // open dynamic scan modal
          cy.get('@startRestartdynamicScanBtn').click({ force: true });

          // assert dynamic scan modal
          cy.findByTestId('dynamicScanModal').within(() => {
            cy.wait('@devicePreferenceReq');

            cy.findByRole('heading', {
              name: cyTranslate('dynamicScan'),
            }).should('exist');

            cy.get('@devicePreferenceReq')
              .its('response.body')
              .then(({ device_type: type, platform_version: version }) => {
                const deviceType = dynamicScanActions.getDeviceTypeText(type);

                const platformVersion =
                  dynamicScanActions.getPlatformVersionText(version);

                cy.findByRole('button', {
                  name: platformVersion,
                })
                  .should('exist')
                  .as('deviceVersionSelect');

                cy.findByRole('button', {
                  name: deviceType,
                })
                  .should('exist')
                  .as('deviceTypeSelect');

                if (type !== ANY_DEVICE) {
                  // change to any device
                  dynamicScanActions.chooseDevicePreferenceOption(
                    '@deviceTypeSelect',
                    cyTranslate('anyDevice')
                  );
                }

                if (version !== ANY_VERSION) {
                  // change to any version
                  dynamicScanActions.chooseDevicePreferenceOption(
                    '@deviceVersionSelect',
                    cyTranslate('anyVersion')
                  );
                }

                cy.findByRole('button', {
                  name: cyTranslate('anyDevice'),
                }).should('exist');

                cy.findByRole('button', {
                  name: cyTranslate('anyVersion'),
                }).should('exist');
              });

            cy.findByRole('button', {
              name: cyTranslate('modalCard.dynamicScan.start'),
              ...DEFAULT_ASSERT_OPTS,
            })
              .should('not.be.disabled')
              .as('startDynamicScanBtn');
          });

          // start dynamic scan
          cy.get('@startDynamicScanBtn').click({ force: true });

          // modal should get closed
          cy.findByTestId('dynamicScanModal', DEFAULT_ASSERT_OPTS).should(
            'not.exist'
          );

          // check different status of dynamic scan btn while stating
          cy.findByTestId('dynamicScan-infoContainer').within(() => {
            DynamicStatusTexts.forEach((status) => {
              cy.findByRole('button', {
                name: status,
                timeout: DYNAMIC_SCAN_STATUS_TIMEOUT,
              }).should('exist');
            });

            // when dynamic started running
            cy.findByRole('button', {
              name: cyTranslate('stop'),
              timeout: DYNAMIC_SCAN_STATUS_TIMEOUT,
            })
              .should('exist')
              .as(DYNAMIC_SCAN_STOP_BTN_ALIAS);
          });

          // wait for screen to load
          cy.wait(5000);

          // trigger app interaction
          app.performInteraction(app.interactions, app);
        });
      }
    )
  );

  afterEach(() => {
    // stop dynamic scan
    cy.get(`@${DYNAMIC_SCAN_STOP_BTN_ALIAS}`).click({ force: true });

    // dynamic scan btn while stoping
    cy.findByTestId('dynamicScan-infoContainer')
      .findByRole('button', {
        name: cyTranslate('deviceShuttingDown'),
      })
      .should('exist');
  });
});
