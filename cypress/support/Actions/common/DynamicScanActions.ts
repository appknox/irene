import cyTranslate from '../../translations';
import { MirageFactoryDefProps } from '../../Mirage';

export interface AppInteraction {
  name: string;
  snapshot: string;
  clickCoordinates: [number, number] | null;
  timeout?: number;
}

export interface AppInformation {
  type: string;
  name: string | RegExp;
  errorThreshold?: number;
  snapshotPrefix: string;
  packageName: string;
  interactions: AppInteraction[];
}

// Assertion Timeout Overrides
export const DEFAULT_ASSERT_OPTS = {
  timeout: 30000,
};

export const NETWORK_WAIT_OPTS = {
  timeout: 60000,
};

export const DYNAMIC_SCAN_STATUS_TIMEOUT = 45000;
export const DYNAMIC_SCAN_STOP_BTN_ALIAS = 'stopDynamicScanBtn';

type ProjectResponseModel = MirageFactoryDefProps['project'];
type FileResponseModel = MirageFactoryDefProps['file'];

export default class DynamicScanActions {
  /**
   * Container for device screen canvas
   */
  get novncRfbCanvasContainer() {
    return cy.document().findByTestId('NovncRfb-canvasContainer');
  }

  /**
   * Finds the project for app information
   * @param {AppInformation} appInfo application details object
   * @param {string} requestAlias alias for project list request
   * @returns {Cypress.Chainable<ProjectResponseModel>} project response object
   */
  getProjectResponseForAppInfo(
    appInfo: AppInformation,
    requestAlias: string
  ): Cypress.Chainable<ProjectResponseModel> {
    return cy
      .get(requestAlias)
      .its('response.body.results')
      .then((pl: ProjectResponseModel[]) => {
        const currentProject = pl.find(
          (p) => p.package_name === appInfo.packageName
        ) as ProjectResponseModel;

        // save current project reponse
        return cy.wrap(currentProject).should('be.ok');
      });
  }

  /**
   * For doing sanity check of file page
   * @param {FileResponseModel} file file response object
   * @param {AppInformation} appInfo application details object
   */
  doFilePageSanityCheck(file: FileResponseModel, appInfo: AppInformation) {
    // check file and app info
    cy.findByAltText(`${file.name} - logo`).should('exist');
    cy.findByText(file.name).should('exist');

    cy.findByText(`${cyTranslate('fileID')} - ${file.id}`).should('exist');

    cy.findByText(appInfo.packageName).should('exist');

    // check completed static scan info
    cy.findByTestId('staticScan-infoContainer', DEFAULT_ASSERT_OPTS).within(
      () => {
        cy.findByText(cyTranslate('staticScan'), DEFAULT_ASSERT_OPTS).should(
          'exist'
        );

        cy.findByText(cyTranslate('completed'), DEFAULT_ASSERT_OPTS).should(
          'exist'
        );
      }
    );

    // Check for severity count for static scan
    cy.findByTestId('fileChart-severityLevelCounts').within(() => {
      // assert risk counts
      cy.findAllByText(file.risk_count_high).should('exist');
      cy.findAllByText(file.risk_count_medium).should('exist');
      cy.findAllByText(file.risk_count_low).should('exist');
      cy.findAllByText(file.risk_count_critical).should('exist');
      cy.findAllByText(file.risk_count_passed).should('exist');
    });
  }

  /**
   * Method to generate base snapshots
   * @param interactions interaction objects for app
   * @param appInfo appInfo application details object
   *
   * @description
   * To use this set `performInteraction` in `appInfo` to this function to generate
   */
  generateBaseSnapshots(
    interactions: AppInteraction[],
    appInfo: AppInformation
  ) {
    cy.wrap(interactions).each((act: AppInteraction) => {
      const [x, y] = act.clickCoordinates || [];

      this.novncRfbCanvasContainer.within(() => {
        if (x && y) {
          cy.get('canvas').click(x, y, { force: true }).wait(2500);
        }

        cy.compareSnapshot(`${appInfo.snapshotPrefix}_${act.snapshot}`).should(
          (result) => {
            expect(result.baseGenerated).to.be.true;
          }
        );
      });
    });
  }

  /**
   * Reloads page and wait for device screen to refresh
   */
  reloadPageForDeviceRefresh() {
    cy.reload();

    // wait for page to fully reload
    cy.document()
      .findByTestId('dynamicScan-infoContainer', {
        timeout: DYNAMIC_SCAN_STATUS_TIMEOUT,
      })
      .findByRole('button', {
        name: cyTranslate('stop'),
        timeout: DYNAMIC_SCAN_STATUS_TIMEOUT,
      })
      .should('exist')
      .as(DYNAMIC_SCAN_STOP_BTN_ALIAS);

    // wait for device screen to render
    cy.wait(3000);
  }

  /**
   * Checks for cropped screen based on error threshold range & interacts with app
   * @param interactions interaction objects for app
   * @param interactionOverrides interactions that need to be overridden
   * @param appInfo appInfo application details object
   * @param snapshotName first snapshot name in app interaction
   * @param errorThresholdRange error range to consider as cropped
   * @param retries number of retries to perform `default is 10`
   */
  checkForCroppedScreenAndInteract(
    interactions: AppInteraction[],
    interactionOverrides: Partial<AppInteraction>[],
    appInfo: AppInformation,
    snapshotName: string,
    errorThresholdRange: [number, number],
    retries = 10
  ) {
    if (retries === 0) {
      throw new Error(
        '[CROP CHECK] Maximum retries limit reached for black screen.'
      );
    }

    const [upperLimit, lowerLimit] = errorThresholdRange;

    this.novncRfbCanvasContainer
      .compareSnapshot(snapshotName, { failSilently: true })
      .then((result) => {
        // check for black screen
        const hasBlackScreen =
          result.error && result.percentage && result.percentage > 0.8;

        if (hasBlackScreen) {
          expect(result.error, '[CROP CHECK] Device black screen reloading...')
            .to.exist;

          // reload and wait
          this.reloadPageForDeviceRefresh();

          this.checkForCroppedScreenAndInteract(
            interactions,
            interactionOverrides,
            appInfo,
            snapshotName,
            errorThresholdRange,
            retries - 1
          );
        } else {
          if (
            result.percentage &&
            upperLimit > result.percentage &&
            lowerLimit < result.percentage
          ) {
            this.interactWithApp(
              interactions.map((it) => {
                const overriddenInteraction = interactionOverrides.find(
                  (io) => io.name === it.name
                );

                return {
                  ...it, // copy all fields
                  ...(overriddenInteraction || {}), // add overrides if present
                  snapshot: `${it.snapshot}_cropped`, // suffix with cropped
                };
              }),
              appInfo
            );
          } else {
            this.interactWithApp(interactions, appInfo);
          }
        }
      });
  }

  /**
   * To interact with apps & retry in case of black screen
   * @param {AppInteraction[]} interactions interaction objects for app
   * @param {AppInformation} appInfo application details object
   * @param {number} retries number of retries to perform `default is 15`
   * @returns {void}
   */
  interactWithApp(
    interactions: AppInteraction[],
    appInfo: AppInformation,
    actionIndex: number = 0,
    retries: number = 15
  ): void {
    if (retries === 0) {
      throw new Error(
        `[INTERACTION] Maximum retries limit reached for black screen at ${interactions[actionIndex]?.name}.`
      );
    }

    if (interactions.length === actionIndex) {
      return;
    }

    // get interaction to perform
    const act = interactions[actionIndex] as AppInteraction;

    const [x, y] = act.clickCoordinates || [];

    this.novncRfbCanvasContainer.within(() => {
      if (x && y) {
        cy.get('canvas')
          .click(x, y, { force: true })
          .wait(act?.timeout || 2500);
      }

      cy.compareSnapshot(`${appInfo.snapshotPrefix}_${act.snapshot}`, {
        errorThreshold: appInfo.errorThreshold ?? 0.05,
        failSilently: true,
      }).then((result) => {
        // check for black screen
        const hasBlackScreen =
          result.error && result.percentage && result.percentage > 0.8;

        if (hasBlackScreen) {
          expect(result.error, '[INTERACTION] Device black screen reloading...')
            .to.exist;

          // reload and wait
          this.reloadPageForDeviceRefresh();

          // restart same interaction
          this.interactWithApp(interactions, appInfo, actionIndex, retries - 1);
        } else {
          expect(result.error).to.be.undefined;

          expect(result.percentage).to.be.below(appInfo.errorThreshold ?? 0.05);

          // start next interaction
          this.interactWithApp(interactions, appInfo, actionIndex + 1, retries);
        }
      });
    });
  }

  /**
   * Get text representation for device type
   * @param {number} deviceType device type value
   * @returns {string}
   */
  getDeviceTypeText(deviceType: number): string {
    return deviceType === 1
      ? cyTranslate('phone')
      : deviceType === 2
        ? cyTranslate('tablet')
        : cyTranslate('anyDevice');
  }

  /**
   * Get text representation for platform version
   * @param {string} platformVersion platform version value
   * @returns {string}
   */
  getPlatformVersionText(platformVersion: string): string {
    return platformVersion === '0'
      ? cyTranslate('anyVersion')
      : platformVersion;
  }
}