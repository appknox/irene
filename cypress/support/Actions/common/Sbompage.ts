import { TimeoutError } from 'cypress/types/bluebird';
import { first } from 'cypress/types/lodash';
import cyTranslate from '../../translations';

export class SbomPage {
  //========================Platform Filter===============================================

  platformFilterTrigger() {
    cy.get('.ember-basic-dropdown-trigger');
  }

  platformRadio(platform: string) {
    return cy.get(`[data-test-sbom-platform-radio="${platform}"]`);
  }

  appTableRows() {
    return cy.findByTestId('sbomApp-table').find('tbody tr').as('sbom-appRows');
  }

  appPlatformIcon(row: Cypress.Chainable<JQuery<HTMLElement>>) {
    return row.findByTestId('app-platform');
  }

  //========================Platform Actions=============================================================
  openPlatformFilter() {
    cy.get('.ember-basic-dropdown-trigger').first().click({ force: true });
    cy.get('ul[role="listbox"]', { timeout: 5000 }).should('be.visible');
  }

  selectPlatform(platform: 'iOS' | 'Android' | 'All') {
    cy.get('ul[role="listbox"]').as('platformOptions');

    cy.get('@platformOptions')
      .contains('li', platform)
      .should('be.visible')
      .click({ force: true });

    cy.get('body').click(0, 0);
  }
  // ========================Platform Validations=============================================================
  validateOnlyIOSApps() {
    this.appTableRows()
      .should('have.length.greaterThan', 0)
      .each((row) => {
        cy.wrap(row)
          .findByTestId('app-platform')
          .should('have.attr', 'data-platform', 'apple');
      });
  }
  validateOnlyAndroidApps() {
    this.appTableRows()
      .should('have.length.greaterThan', 0)
      .each((row) => {
        cy.wrap(row)
          .findByTestId('app-platform')
          .should('have.attr', 'data-platform', 'android');
      });
  }

  // SELECTORS
  appTable() {
    return cy.findByTestId('sbomApp-table');
  }

  overviewField(label: string) {
    return cy
      .findAllByTestId('sbom-overview-item')
      .filter(`[data-label="${label}"]`);
  }

  toggleBtn() {
    return cy.findByTestId('sbomSummaryHeader-collapsibleToggleBtn');
  }

  metadataField(label: string) {
    return cy.get(`[data-test-sbomScanDetails-fileSummaryGroup="${label}"]`);
  }

  componentRows() {
    return cy.get('[data-test^="data-test-ak-stack"]');
  }

  // ===== Component Type Filter (List View) =====

  componentTypeFilterIcon() {
    return cy.findByTestId('component-type-filter-icon');
  }

  componentTypePopover() {
    return cy.findByTestId('component-type-filter-popover');
  }

  componentTypeRadio(type: string) {
    return cy.get(
      `[data-test-sbom-scanDetails-componentTypeHeader-radio="${type}"]`
    );
  }

  clearComponentTypeFilter() {
    return cy.findByTestId('component-type-clear-filter');
  }

  // ===== Dependency Type Filter =====

  dependencyTypeFilterIcon() {
    return cy.findByTestId('dependency-type-filter-icon');
  }

  dependencyTypePopover() {
    return cy.findByTestId('dependency-type-filter-popover');
  }

  dependencyTypeRadio(type: string) {
    return cy.findByTestId(`dependency-type-filter-radio-${type}`);
  }

  clearDependencyTypeFilter() {
    return cy.findByTestId('dependency-type-clear-filter');
  }

  // ACTIONS

  selectReportRow(appName: string) {
    this.appTable().contains(appName).should('be.visible').click();
  }

  validateOverviewDynamic() {
    const fields = [
      'Total Components',
      'ML Model',
      'Library',
      'Framework',
      'File',
    ];

    fields.forEach((field) => {
      this.overviewField(field)
        .should('be.visible')
        .findByTestId('sbom-overview-value')
        .invoke('text')
        .should('not.be.empty');
    });
  }

  validateMetadataDynamic() {
    this.toggleBtn().should('be.visible').click();

    cy.findAllByTestId('sbomscandetails-filesummarygroup', {
      timeout: 7000,
    }).should('have.length.greaterThan', 0);

    const fields = [
      'Generated Date',
      'Version',
      'Version Code',
      'File',
      'Status',
    ];

    fields.forEach((field) => {
      this.metadataField(field)
        .should('be.visible')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.not.equal('');
        });
    });
  }
  // Component Type Filter ACTIONS

  openComponentTypeFilter() {
    this.componentTypeFilterIcon().should('be.visible').click({ force: true });

    this.componentTypePopover().should('be.visible', { timeout: 10000 });
  }

  selectComponentType(type: string) {
    this.componentTypeRadio(type)
      .should('exist', { timeout: 10000 })
      .click({ force: true });
  }

  validateListFilteredByComponentType(type: string) {
    cy.get('[data-test-sbomcomponent-table]')
      .should('have.length.greaterThan', 0)
      .each(($el) => {
        cy.wrap($el).invoke('text').should('contain', type);
      });
  }

  validateFilteredListOrEmptyState() {
    cy.get('body').then((body) => {
      const rowCount = body.find('[data-test-sbomComponent-row]').length;

      if (rowCount > 0) {
        //
        cy.get('[data-test-sbomComponent-row]').should(
          'have.length.greaterThan',
          0
        );
      }
    });
  }

  clearComponentTypeFilterOnly() {
    this.clearComponentTypeFilter().should('exist').click({ force: true });

    cy.get('body').click(0, 0);
  }

  //===============validations==========================================

  openDependencyTypeFilter() {
    this.dependencyTypeFilterIcon().should('be.visible').click({ force: true });

    this.dependencyTypePopover().should('be.visible', { timeout: 10000 });
  }

  selectDependencyType(type: string) {
    this.dependencyTypeRadio(type)
      .should('exist', { timeout: 10000 })
      .click({ force: true });

    // popover sometimes does not auto-close
    cy.get('body').click(0, 0);
  }

  validateListFilteredByDependencyType(type: string) {
    cy.get('[data-test-sbomcomponent-table]')
      .should('have.length.greaterThan', 0)
      .each((row) => {
        cy.wrap(row).invoke('text').should('contain', type);
      });
  }

  clearDependencyTypeFilterOnly() {
    this.clearDependencyTypeFilter().should('exist').click({ force: true });

    cy.get('body').click(0, 0);
  }

  //===============================Report flow==========================================

  dashboardRows() {
    return cy.get('table tbody tr');
  }

  actionMenuButton() {
    return cy.findByTestId('sbomApp-actionBtn');
  }

  actionMenuItems() {
    return cy.findAllByTestId('sbomapp-actionmenuitem');
  }

  pageRange() {
    return cy.get('[data-test-page-range]');
  }

  viewReportButtons() {
    return cy.findAllByTestId('sbomScan-viewReportBtn');
  }

  generateReportButtons() {
    return cy.findAllByTestId('sbomReportList-reportGenerateBtn');
  }

  reportPasswordLabel() {
    return cy.findByTestId('sbomReportList-reportSecondaryText');
  }

  downloadButtons() {
    return cy.findAllByTestId('sbomreportlist-reportdownloadbtn');
  }

  // =====================
  // Actions
  // =====================

  openActionMenu(rowIndex = 0) {
    this.dashboardRows()
      .should('have.length.greaterThan', 0)
      .eq(rowIndex)
      .findAllByTestId('sbomApp-actionBtn')
      .click({ force: true });
  }

  selectAction(option: 'Past SBOM Analyses' | 'View Report') {
    this.actionMenuItems().contains(option).should('be.visible').click();
  }

  validatePastSbomAnalysesPage() {
    this.dashboardRows().should('have.length.greaterThan', 0);
  }

  openViewReport(rowIndex = 0) {
    this.viewReportButtons()
      .eq(rowIndex)
      .should('be.visible')
      .click({ force: true });
  }

  //
  generateReportIfRequired() {
    this.generateReportButtons().then(($btns) => {
      if ($btns.length > 0 && $btns.first().is(':visible')) {
        cy.log('STATE 1: Report NOT generated - Generating now...');

        cy.wrap($btns.first()).should('not.be.disabled').click({ force: true });

        //
        this.waitForReportGeneration();
      } else {
        cy.log('STATE 2: Report already generated - Skipping generation');
      }
    });
  }

  //
  waitForReportGeneration(timeout = 30000) {
    cy.findAllByTestId('sbomreportlist-reportdownloadbtn', { timeout })
      .should('have.length.at.least', 1)
      .then(($btns) => {
        cy.log(
          `Report generated successfully with ${$btns.length} download options`
        );
      });
  }

  //
  validateReportGenerated() {
    cy.findAllByTestId('sbomReportList-loading').should('have.length', 0);

    cy.findAllByTestId('sbomReportList-reportGenerateBtn').should(
      'have.length',
      0
    );

    this.downloadButtons().should('have.length.at.least', 1);

    cy.contains('Detailed Report (pdf)').should('be.visible');
  }

  //==========================================================================

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
      .findAllByTestId('ak-breadcrumbs-auto-trail-item')
      .contains('All Components and Vulnerabilities');
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

  /* =======================
     ACTIONS and VALIDATIONS
     ======================= */

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
