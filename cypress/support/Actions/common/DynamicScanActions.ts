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
  deviceName?: string;
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

export const DYNAMIC_SCAN_STATUS_TIMEOUT = 75000;
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
   * Dynamic scan stop button
   */
  getDynamicScanStopBtn() {
    return cy.findByRole('button', {
      name: cyTranslate('stop'),
      timeout: DYNAMIC_SCAN_STATUS_TIMEOUT,
    });
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
    cy.findByAltText(`${file.name} - logo`, DEFAULT_ASSERT_OPTS).should(
      'exist'
    );

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
    cy.findByTestId(
      'fileChart-severityLevelCounts',
      DEFAULT_ASSERT_OPTS
    ).within(() => {
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
          cy.get('canvas')
            .click(x, y, { force: true })
            .wait(act.timeout ?? 2500);
        }

        cy.compareSnapshot(
          `[${appInfo.deviceName}]_${appInfo.snapshotPrefix}_${act.snapshot}`
        ).should((result) => {
          expect(result.baseGenerated).to.be.true;
        });
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
      .findByTestId('deviceWrapper-statusChipAndScanCTAContainer', {
        timeout: DYNAMIC_SCAN_STATUS_TIMEOUT,
      })
      .findByRole('button', {
        name: cyTranslate('stop'),
        timeout: DYNAMIC_SCAN_STATUS_TIMEOUT,
      })
      .should('exist')
      .as(DYNAMIC_SCAN_STOP_BTN_ALIAS);

    // check different status of dynamic scan status chip while starting
    cy.document()
      .findByTestId('deviceWrapper-deviceViewer-fullscreenBtn', {
        timeout: DYNAMIC_SCAN_STATUS_TIMEOUT,
      })
      .should('exist')
      .click();

    // wait for device screen to render
    cy.wait(3000);
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

      const deviceNamePrefix = appInfo.deviceName
        ? `[${appInfo.deviceName}]_` // Use specific device model if available
        : '';

      cy.compareSnapshot(
        `${deviceNamePrefix}${appInfo.snapshotPrefix}_${act.snapshot}`,
        {
          errorThreshold: appInfo.errorThreshold ?? 0.05,
          failSilently: true,
        }
      ).then((result) => {
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
          expect(result.error, 'Result Error').to.be.undefined;

          expect(result.percentage).to.be.below(appInfo.errorThreshold ?? 0.05);

          // start next interaction
          this.interactWithApp(interactions, appInfo, actionIndex + 1, retries);
        }
      });
    });
  }

  /**
   * Helper to choose device preference
   * @param selectAlias alias for device preference select
   * @param optionName name of the option to select
   */
  chooseDevicePreferenceOption(selectAlias: string, optionName: string) {
    cy.get(selectAlias).click({ force: true });

    cy.document()
      .findByRole('option', {
        name: optionName,
      })
      .should('exist')
      .click({ force: true });

    // cy.document().findByText(cyTranslate('savedPreferences')).should('exist');
  }

  /**
   * Get text representation for device selection
   * @param {number} selection device selection value
   * @returns {string}
   */
  getManualDeviceSelection(selection: number): string {
    return selection === 0
      ? cyTranslate('anyAvailableDeviceWithAnyOS')
      : cyTranslate('specificDevice');
  }
}
