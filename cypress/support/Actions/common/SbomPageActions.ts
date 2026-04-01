import { MirageFactoryDefProps } from '../../Mirage';
import cyTranslate from '../../../support/translations';

// Assertion Timeout Overrides
export const DEFAULT_ASSERT_OPTS = {
  timeout: 10000,
};

export const NETWORK_WAIT_OPTS = {
  timeout: 60000,
};

export default class SbomPageActions {
  expandNodeIcon() {
    return cy.findAllByTestId('component-tree-node-expand-icon').first();
  }

  collapseAllBtn() {
    return cy.findByTestId('sbom-scan-details-collapse-all-btn', {
      timeout: 5000,
    });
  }

  componentLinks() {
    return cy.findAllByTestId('component-tree-node-label');
  }

  componentDetailsTab(tabId: 'overview' | 'vulnerabilities') {
    return cy.findByTestId(`sbom-component-details-tab-"${tabId}"`);
  }

  componentSummary(label: string) {
    return cy.findByTestId(`sbom-component-details-summary-${label}`);
  }

  componentStatus(status: string) {
    return cy.findByTestId(`sbom-component-status-${status}`);
  }

  /**
   * @name getAppTableRows
   * @description Gets the app table rows
   * @returns Cypress.Chainable<JQuery<HTMLElement>>
   */
  getAppTableRows() {
    return cy
      .findAllByTestId(/^sbomApp-row-/, DEFAULT_ASSERT_OPTS)
      .as('sbomAppRows');
  }

  /**
   * @name checkAndWaitForAppLoadingView
   * @description Checks and waits for the app loading view to be loaded
   * @returns void
   */
  checkAndWaitForAppLoadingView() {
    cy.findByTestId('sbomApp-emptyLoadingView-loading').should('exist');

    cy.findByTestId(
      'sbomApp-emptyLoadingView-loading',
      DEFAULT_ASSERT_OPTS
    ).should('not.exist');
  }

  /**
   * @name openPlatformFilter
   * @description Opens the platform filter dropdown
   * @returns void
   */
  openPlatformFilter() {
    cy.findByTestId('sbom-platform-filterSelect')
      .findByRole('combobox')
      .should('exist')
      .click({ force: true });
  }

  /**
   * @name selectPlatform
   * @description Selects the platform from the platform filter dropdown
   * @param platform - The platform to select
   * @returns void
   */
  selectPlatform(platform: string) {
    return cy
      .findByRole('option', { name: platform })
      .should('be.visible')
      .click({ force: true });
  }

  /**
   * @name validateSbomAppRowsByPlatform
   * @description Validates the app table rows by platform
   * @param platform - The platform to validate
   * @returns void
   */
  validateSbomAppRowsByPlatform(platform: 'android' | 'apple') {
    return this.getAppTableRows()
      .should('have.length.greaterThan', 0)
      .each((row) => {
        cy.wrap(row).within(() => {
          cy.findByTestId(`app-platform-${platform}`).should('exist');
        });
      });
  }

  /**
   * @name downloadSBOMAppReport
   * @description Clicks on the download button for the specified report type (pdf or cyclonedx json file) in the past SBOM analyses view to trigger the download of the report.
   * @param reportType - The type of report to download ('pdf' or 'cyclonedx_json_file')
   */
  downloadSBOMAppReport(reportType: 'pdf' | 'cyclonedx_json_file') {
    cy.findAllByTestId(`sbomReportList-reportDownloadBtn-${reportType}`, {
      timeout: 10000,
    })
      .should('be.visible')
      .click({ force: true });
  }

  // ===== SBOM Detail Page — Actions =====

  /**
   * @name navigateToSbomDetailPage
   * @description Navigates to the SBOM detail page by clicking on the app with the specified package name in the app table.
   * @param packageName - The package name of the app to navigate to
   */
  navigateToSbomDetailPage(packageName: string) {
    this.getAppTableRows()
      .contains(new RegExp(packageName, 'i'))
      .should('be.visible')
      .click({ force: true });
  }

  /**
   * @name validateOComponentDetailsOverviewCounts
   * @description Validates overview counts using real values from sbomFileSummary API response
   */
  validateOComponentDetailsOverviewCounts(sbomFileSummaryAlias: string) {
    cy.get(sbomFileSummaryAlias)
      .its('response.body')
      .then((componentCount) => {
        const {
          component_count,
          machine_learning_model_count,
          framework_count,
          library_count,
          file_count,
        } = componentCount;

        const fields = {
          [cyTranslate('sbomModule.totalComponents')]: component_count,
          [cyTranslate('sbomModule.mlModel')]: machine_learning_model_count,
          [cyTranslate('library')]: library_count,
          [cyTranslate('framework')]: framework_count,
          [cyTranslate('file')]: file_count,
        };

        Object.keys(fields).forEach((key) => {
          cy.findByTestId(`sbom-overview-item-${key}`)
            .should('be.visible')
            .should('contain', fields[key]);
        });
      });
  }

  /**
   * @name validateMetadataDynamic
   * @description Validates metadata fields using real values from sbomFileComponents API response
   */
  validateMetadataDynamic(sbomFileAlias: string = '@sbomFileComponents') {
    cy.findByTestId('sbom-summary-header-collapsible-toggle-btn')
      .should('be.visible')
      .click();

    cy.wait(sbomFileAlias, { timeout: 10000 })
      .its('response.body')
      .as('sbomFileData');

    cy.get<MirageFactoryDefProps['sbom-file']>('@sbomFileData').then(
      (sbomFile) => {
        cy.findAllByTestId(/^sbom-scan-details-file-summary-group-/, {
          timeout: 7000,
        }).should('have.length.greaterThan', 0);

        const metadataFields = {
          [cyTranslate('status')]: sbomFile.status,
          [cyTranslate('sbomModule.generatedDate')]: sbomFile.completed_at,
          [cyTranslate('file')]: sbomFile.id,
        };

        Object.keys(metadataFields).forEach((label) => {
          const expectedValue = metadataFields[label];

          if (expectedValue) {
            cy.findByTestId(`sbom-scan-details-file-summary-group-${label}`)
              .should('be.visible')
              .should('contain', expectedValue);
          }
        });
      }
    );
  }

  /**
   * @name openComponentTypeFilter
   */
  openComponentTypeFilter() {
    cy.findByTestId('sbom-component-type-filter-icon')
      .should('be.visible')
      .click({ force: true });

    cy.findByTestId('sbom-component-type-filter-popover').should(
      'be.visible',
      DEFAULT_ASSERT_OPTS
    );
  }

  /**
   * @name selectComponentType
   */
  selectComponentType(type: string) {
    cy.findByTestId(`sbom-component-type-filter-radio-${type}`)
      .should('exist', DEFAULT_ASSERT_OPTS)
      .click({ force: true });
  }

  /**
   * @name validateFilteredSBOMComponentRows
   * @description Validates filtered rows contain the selected component type.
   * Gracefully handles empty results — some types may have no components.
   */
  validateFilteredSBOMComponentRows(type: string) {
    cy.get('body').then((body) => {
      const rowCount = body.find('[data-test-cy="sbom-component-row"]').length;

      if (rowCount > 0) {
        cy.findAllByTestId('sbom-component-row')
          .should('have.length.greaterThan', 0)
          .each((row) => {
            cy.wrap(row).invoke('text').should('contain', type);
          });
      }
    });
  }

  /**
   * @name clearComponentTypeFilterOnly
   * @description Clears component type filter without selecting another type
   */
  clearComponentTypeFilterOnly() {
    cy.findByTestId('sbom-component-type-clear-filter')
      .should('exist')
      .click({ force: true });

    cy.get('body').click(0, 0);
  }

  /**
   * @name openDependencyTypeFilter
   * @description Opens the dependency type filter popover
   */
  openDependencyTypeFilter() {
    cy.findByTestId('sbom-dependency-type-filter-icon')
      .should('be.visible')
      .click({ force: true });

    cy.findByTestId('sbom-dependency-type-filter-popover').should(
      'be.visible',
      DEFAULT_ASSERT_OPTS
    );
  }

  /**
   * @name selectDependencyType
   */
  selectDependencyType(type: string) {
    cy.findByTestId(`sbom-dependency-type-filter-radio-${type}`)
      .should('exist', DEFAULT_ASSERT_OPTS)
      .click({ force: true });

    cy.get('body').click(0, 0);
  }

  /**
   * @name clearDependencyTypeFilterOnly
   * @description Clears dependency type filter without selecting another type
   */
  clearDependencyTypeFilterOnly() {
    cy.findByTestId('sbom-dependency-type-clear-filter')
      .should('exist')
      .click({ force: true });

    cy.get('body').click(0, 0);
  }
}
