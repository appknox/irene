import { MirageFactoryDefProps } from '../../Mirage';
import cyTranslate from '../../../support/translations';
import dayjs from 'dayjs';
import sbomScanSummary from 'irene/mirage/factories/sbom-scan-summary';
import { de } from '@faker-js/faker';

// Assertion Timeout Overrides
export const DEFAULT_ASSERT_OPTS = {
  timeout: 10000,
};

export const NETWORK_WAIT_OPTS = {
  timeout: 60000,
};

export default class SbomPageActions {
  /**
   * @name platformFilterTrigger
   * @description Triggers the platform filter dropdown
   * @returns void
   */

  platformRadio(platform: string) {
    return cy.get(`[data-test-sbom-platform-radio="${platform}"]`);
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

  appPlatformIcon(row: Cypress.Chainable<JQuery<HTMLElement>>) {
    return row.findByTestId('app-platform');
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

  // SELECTORS
  /**
   * @name appTable
   * @description Gets the app table
   * @returns Cypress.Chainable<JQuery<HTMLElement>>
   */
  appTable() {
    return cy.findByTestId('sbomApp-table');
  }

  toggleBtn() {
    return cy.get('[data-test-sbomSummaryHeader-collapsibleToggleBtn]');
  }

  metadataField(label: string) {
    return cy.get(`[data-test-sbomScanDetails-fileSummaryGroup="${label}"]`);
  }

  // ===== Component Type Filter (List View) =====

  componentTypeFilterIcon() {
    return cy.get('[data-test-sbom-scanDetails-componentTypeHeader-icon]');
  }

  componentTypePopover() {
    return cy.get('[data-test-sbom-scanDetails-componentTypeHeader-popover]');
  }

  componentTypeRadio(type: string) {
    return cy.get(
      `[data-test-sbom-scanDetails-componentTypeHeader-radio="${type}"]`
    );
  }

  clearComponentTypeFilter() {
    return cy.get(
      '[data-test-sbom-scanDetails-componentTypeHeader-clearFilter]'
    );
  }

  // ===== Dependency Type Filter =====

  dependencyTypeFilterIcon() {
    return cy.get('[data-test-sbom-scanDetails-dependencyTypeHeader-icon]');
  }

  dependencyTypePopover() {
    return cy.get('[data-test-sbom-scanDetails-dependencyTypeHeader-popover]');
  }

  dependencyTypeRadio(type: string) {
    return cy.findByTestId(`dependency-type-filter-radio-${type}`);
  }

  clearDependencyTypeFilter() {
    return cy.get(
      '[data-test-sbom-scanDetails-dependencyTypeHeader-clearFilter]'
    );
  }

  /**
   * @name selectAppFromTableRow
   * @description Selects the app from the table row
   * @param appName - The app name to select
   * @returns void
   */
  selectAppFromTableRow(appName: string) {
    this.getAppTableRows()
      .contains(new RegExp(appName, 'i'))
      .first()
      .click({ force: true });
  }

  /**
   * @name validateOverviewDynamic
   * @description Validates the overview dynamic fields in SBOM Component Details Page
   * @returns void
   */
  validateOComponentDetailsOverviewCounts(sbomFileSummaryAlias: string) {
    cy.wait(sbomFileSummaryAlias, NETWORK_WAIT_OPTS)
      .its('response.body')
      .as('componentCount');

    cy.get<MirageFactoryDefProps['sbom-scan-summary']>('@componentCount').then(
      (componentCount) => {
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
      }
    );
  }

  validateMetadataDynamic(sbomFileAlias: string = '@sbomFileComponents') {
    this.toggleBtn().should('be.visible').click();
    cy.wait(sbomFileAlias, { timeout: 10000 })
      .its('response.body')
      .as('sbomFileData');

    cy.get<MirageFactoryDefProps['sbom-file']>('@sbomFileData').then(
      (sbomFile) => {
        cy.findAllByTestId('sbomscandetails-filesummarygroup', {
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
            this.metadataField(label)
              .should('be.visible')
              .should('contain', expectedValue);
          }
        });
      }
    );
  }
  // Component Type Filter ACTIONS

  openComponentTypeFilter() {
    this.componentTypeFilterIcon().should('be.visible').click({ force: true });

    this.componentTypePopover().should('be.visible', DEFAULT_ASSERT_OPTS);
  }

  selectComponentType(type: string) {
    this.componentTypeRadio(type)
      .should('exist', DEFAULT_ASSERT_OPTS)
      .click({ force: true });
  }
  validateComponentTypeFilteredRows(type: string) {
    cy.get('body').then((body) => {
      const rowCount = body.find('[data-test-sbomComponent-row]').length;

      if (rowCount > 0) {
        // Rows exist - validate they contain the type
        cy.get('[data-test-sbomComponent-row]')
          .should('have.length.greaterThan', 0)
          .each((row) => {
            cy.wrap(row).invoke('text').should('contain', type);
          });
      }
    });
  }
  /**
   * @param clearComponentTypeFilterOnly
   * @description Clears the component type filter selection without selecting another type. This is necessary to validate that the filter is cleared and all rows are shown again, as sometimes selecting another type does not clear the previous selection properly in the UI.
   */
  clearComponentTypeFilterOnly() {
    this.clearComponentTypeFilter().should('exist').click({ force: true });
    cy.get('body').click(0, 0);
  }

  /**
   * @parm openDependencyTypeFilter
   * @description Opens the dependency type filter popover
   * @returns void
   */
  openDependencyTypeFilter() {
    this.dependencyTypeFilterIcon().should('be.visible').click({ force: true });

    this.dependencyTypePopover().should('be.visible', DEFAULT_ASSERT_OPTS);
  }
  /**  * @name selectDependencyType
   * @description Selects the dependency type from the dependency type filter
   * @param type - The dependency type to select (e.g. "Direct", "Transitive")
   * @returns void
   */
  selectDependencyType(type: string) {
    this.dependencyTypeRadio(type)
      .should('exist', DEFAULT_ASSERT_OPTS)
      .click({ force: true });
    // popover sometimes does not auto-close
    cy.get('body').click(0, 0);
  }
  /**
   * @name validateDependencyTypeFilteredRows
   * @description Validates the filtered rows in the component list based on the selected dependency type. If there are rows present, it checks that each row contains the specified dependency type.
   */
  validateDependencyTypeFilteredRows(type: string) {
    cy.get('body').then((body) => {
      const rowCount = body.find('[data-test-sbomComponent-row]').length;

      if (rowCount > 0) {
        cy.get('[data-test-sbomComponent-row]')
          .should('have.length.greaterThan', 0)
          .each((row) => {
            cy.wrap(row).invoke('text').should('contain', type);
          });
      }
    });
  }
  /**
   * @name clearDependencyTypeFilterOnly
   * @description Clears the dependency type filter selection without selecting another type. This is necessary to validate that the filter is cleared and all rows are shown again, as sometimes selecting another type does not clear the previous selection properly in the UI.
   */
  clearDependencyTypeFilterOnly() {
    this.clearDependencyTypeFilter().should('exist').click({ force: true });
    cy.get('body').click(0, 0);
  }

  //===============================Report flow==========================================
  dashboardRows() {
    return cy.get('table tbody tr');
  }
  actionMenuButton() {
    return cy.get('[data-test-sbomApp-actionBtn]');
  }

  actionMenuItems() {
    return cy.get('[data-test-sbomApp-actionMenuItem]');
  }

  pageRange() {
    return cy.get('[data-test-page-range]');
  }

  viewReportButtons() {
    return cy.get('[data-test-sbomScan-viewReportBtn]');
  }

  generateReportButtons() {
    return cy.findAllByTestId('sbomReportList-reportGenerateBtn');
  }

  reportPasswordLabel() {
    return cy.get('[data-test-sbomReportList-reportGeneratingText]');
  }

  downloadButtons() {
    return cy.findAllByTestId('sbomreportlist-reportdownloadbtn');
  }

  downloadReport(index: number = 0) {
    this.downloadButtons()
      .eq(index)
      .should('be.visible')
      .click({ force: true });
  }

  /**
   * @name openActionMenu
   * @description Opens the action menu for the first app in the table
   */
  openActionMenu(rowIndex: number = 0) {
    this.dashboardRows()
      .should('have.length.greaterThan', 0)

      .eq(rowIndex)
      .findAllByTestId('sbomApp-actionBtn')
      .click({ force: true });
  }
  /**
   * @param selectOption - The option to select from the action menu. It can be either 'Past SBOM Analyses' or 'View Report'
   */
  selectAction(option: 'Past SBOM Analyses' | 'View Report') {
    this.actionMenuItems()
      .contains(option)
      .should('be.visible')
      .click({ force: true });
  }
  /**
   * @param validatePastSbomAnalysesPage
   * @description Validates that the Past SBOM Analyses page is displayed by checking for the presence of the analyses table and relevant text on the page.
   */
  validatePastSbomAnalysesPage() {
    cy.get('[data-test-sbomscan-table]').should('have.length.greaterThan', 0);
    cy.findByText(cyTranslate('sbomModule.pastSbomAnalyses')).should(
      'be.visible'
    );
    // cy.findByText(cyTranslate('sbomModule.pastSbomAnalysesDescription')).should(
    //   'be.visible'
    // );
  }

  openViewReport(rowIndex: number = 0) {
    this.viewReportButtons()
      .eq(rowIndex)
      .should('be.visible')
      .click({ force: true });
  }

  /**
   * @name generateReport
   * @description Checks if the generate report button is visible, if yes, clicks on it to generate the report
   */
  generateReport() {
    this.generateReportButtons().then(($btns) => {
      if ($btns.length > 0 && $btns.first().is(':visible')) {
        cy.log('STATE 1: Report NOT generated - Generating now...');

        cy.wrap($btns.first()).should('not.be.disabled').click({ force: true });
        this.waitForReportGeneration();
      } else {
        cy.log('STATE 2: Report already generated - Skipping generation');
      }
    });
  }
  /**
   *
   * @param timeout
   * @description Waits for the report to be generated by checking for the presence of the download buttons.
   */
  waitForReportGeneration(timeout = 120000) {
    cy.findAllByTestId('sbomreportlist-reportdownloadbtn', { timeout })
      .should('have.length.at.least', 1)
      .then(($btns) => {
        cy.log(
          `Report generated successfully with ${$btns.length} download options`
        );
      });
  }
  /**
   * @name validateReportGenerated
   * @description Validates that the report has been generated by checking for the absence of the loading indicators and the presence of the download buttons and relevant text.
   */
  validateReportGenerated() {
    cy.findAllByTestId('sbomReportList-loading').should('have.length', 0);

    cy.findAllByTestId('sbomReportList-reportGenerateBtn').should(
      'have.length',
      0
    );

    this.downloadButtons().should('have.length.at.least', 1);

    cy.findByText(cyTranslate('sbomModule.sbomDownloadPdfPrimaryText')).should(
      'be.visible'
    );
  }

  treeViewBtn() {
    return cy.get('[data-test-sbomscandetails-switch-treeviewbutton]');
  }

  listViewBtn() {
    return cy.get('[data-test-sbomscandetails-switch-listviewbutton]');
  }

  expandNodeIcon() {
    return cy.get('[data-test-component-tree-nodeexpandicon]').first();
  }

  collapseAllBtn() {
    return cy.get('[data-test-sbomscandetails-collapseallbutton]');
  }

  componentLinks() {
    return cy.get('[data-test-component-tree-nodelabel]');
  }

  // ===== Breadcrumb Selectors =====
  breadcrumbContainer() {
    return cy.get('[data-test-ak-breadcrumbs-auto-trail-container]');
  }

  breadcrumbBackToSbom() {
    return cy
      .findByText(cyTranslate('sbomModule.allComponentsAndVulnerabilities'))
      .should('be.visible');
  }

  // ===== Component Details Selectors =====
  componentOverviewTab() {
    return cy.get('[data-test-sbomcomponentdetails-tab="overview"]');
  }

  componentVulnTab() {
    return cy.get('[data-test-sbomcomponentdetails-tab="vulnerabilities"]');
  }

  componentSummary(label: string) {
    return cy.get(
      `[data-test-sbomscandetails-componentdetails-summary="${label}"]`
    );
  }

  componentStatus(status: string) {
    return cy.get(`[data-test-sbomcomponent-status="${status}"]`);
  }

  validateDefaultTreeView() {
    // Tree view is active by default
    this.treeViewBtn().invoke('attr', 'class').should('contain', 'active');

    // Collapse All should be disabled initially
    this.collapseAllBtn().should('be.disabled');
  }

  switchToListViewAndValidate() {
    this.listViewBtn().click();
    // List view becomes active
    this.listViewBtn().invoke('attr', 'class').should('contain', 'active');
  }

  switchBackToTreeView() {
    this.treeViewBtn().click();

    // Tree view becomes active again
    this.treeViewBtn().invoke('attr', 'class').should('contain', 'active');

    // Collapse All resets to disabled
    this.collapseAllBtn().should('be.disabled');
  }

  expandTreeNodeAndValidate() {
    this.expandNodeIcon().should('be.visible').click();
    this.collapseAllBtn().should('not.be.disabled');
  }

  collapseAllAndValidate() {
    this.collapseAllBtn().click({ force: true });
    this.collapseAllBtn().should('be.disabled');
  }

  openFirstComponent() {
    this.componentLinks().first().click({ force: true });
  }

  validateComponentDetailsPage() {
    this.componentOverviewTab().should('be.visible', { timeout: 10000 });
    this.componentVulnTab().should('be.visible');

    this.componentSummary('Component Type').should('be.visible');
    this.componentSummary('Dependency Type').should('be.visible');

    this.componentSummary('Status').should('be.visible');

    this.componentStatus('SECURE').should('exist');
  }

  navigateBackToSbomFromBreadcrumb() {
    this.breadcrumbContainer().should('be.visible');
    this.breadcrumbBackToSbom().click();
    this.treeViewBtn().should('be.visible');
  }
}
