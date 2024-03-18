import APP_TRANSLATIONS from '../../translations';
import { MirageFactoryDefProps } from '../../Mirage';

export interface AppInteraction {
  name: string;
  snapshot: string;
  clickCoordinates: [number, number] | null;
}

export interface AppInformation {
  type: string;
  name: string | RegExp;
  snapshotPrefix: string;
  packageName: string;
  interactions: AppInteraction[];
}

type ProjectResponseModel = MirageFactoryDefProps['project'];
type FileResponseModel = MirageFactoryDefProps['file'];

const DEFAULT_ASSERT_OPTS = {
  timeout: 30000,
};

export default class DynamicScanActions {
  /**
   * Finds the project for app information
   * @param {AppInformation} appInfo application details object
   * @param {string} requestAlias alias for project list request
   * @returns {Cypress.Chainable<ProjectResponseModel>} project response object
   */
  getProjectResponseForAppInfo(appInfo: AppInformation, requestAlias: string) {
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

    cy.findByText(`${APP_TRANSLATIONS.fileID} - ${file.id}`).should('exist');

    cy.findByText(appInfo.packageName).should('exist');

    // check completed static scan info
    cy.findByTestId('staticScan-infoContainer', DEFAULT_ASSERT_OPTS).within(
      () => {
        cy.findByText(APP_TRANSLATIONS.staticScan, DEFAULT_ASSERT_OPTS).should(
          'exist'
        );

        cy.findByText(APP_TRANSLATIONS.completed, DEFAULT_ASSERT_OPTS).should(
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
   * To interact with apps & retry in case of black screen
   * @param {AppInteraction[]} interactions interaction objects for app
   * @param {AppInformation} appInfo application details object
   * @param {number} retries number of retries to perform default is 4
   * @returns {void}
   */
  interactWithApp(
    interactions: AppInteraction[],
    appInfo: AppInformation,
    retries = 3
  ) {
    if (retries === 0) {
      return;
    }

    cy.wrap(interactions).each((act: AppInteraction, index) => {
      const [x, y] = act.clickCoordinates || [];

      cy.findByTestId('NovncRfb-canvasContainer').within(() => {
        if (x && y) {
          cy.get('canvas').click(x, y, { force: true }).wait(2000);
        }

        cy.compareSnapshot(`${appInfo.snapshotPrefix}_${act.snapshot}`, {
          errorThreshold: 0.05,
          failSilently: true,
        }).should((result) => {
          // check for black screen
          const hasBlackScreen =
            result.error && result.percentage && result.percentage > 0.8;

          if (hasBlackScreen) {
            expect(result.error, 'Device black screen reloading...').to.exist;

            cy.reload();

            // restart from current failed interaction
            this.interactWithApp(
              interactions.slice(index),
              appInfo,
              retries - 1
            );
          }

          expect(result.error).to.be.undefined;
          expect(result.percentage).to.be.below(0.05);
        });
      });
    });
  }

  /**
   * Get text representation for device type
   * @param {number} deviceType device type value
   * @returns {string}
   */
  getDeviceTypeText(deviceType: number) {
    return deviceType === 1
      ? APP_TRANSLATIONS.phone
      : deviceType === 2
        ? APP_TRANSLATIONS.tablet
        : APP_TRANSLATIONS.anyDevice;
  }

  /**
   * Get text representation for platform version
   * @param {string} platformVersion platform version value
   * @returns {string}
   */
  getPlatformVersionText(platformVersion: string) {
    return platformVersion === '0'
      ? APP_TRANSLATIONS.anyVersion
      : platformVersion;
  }
}
