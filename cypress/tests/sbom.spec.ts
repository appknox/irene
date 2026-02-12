import LoginActions from '../support/Actions/auth/LoginActions';
import NetworkActions from '../support/Actions/common/NetworkActions';
import { API_ROUTES } from '../support/api.routes';
import { APPLICATION_ROUTES } from '../support/application.routes';
import SbomPageActions from '../support/Actions/common/SbomPageActions';
import UploadAppActions from '../support/Actions/common/UploadAppActions';
import cyTranslate from '../support/translations';

const loginActions = new LoginActions();
const networkActions = new NetworkActions();
const sbomPageActions = new SbomPageActions();

const username = Cypress.env('TEST_USERNAME') || 'testuser';
const password = Cypress.env('TEST_PASSWORD') || 'testpass';

const NETWORK_WAIT_OPTS = {
  timeout: 60000,
};

const SBOM_APP_SEARCH_QUERY = 'com.appknox.dvia';
const SBOM_MFVA_APP_SEARCH_QUERY = 'com.appknox.mfva';

Cypress.on('uncaught:exception', () => false);

describe('SBOM Page', () => {
  beforeEach(() => {
    // Setup API intercepts
    networkActions.hideNetworkLogsFor({ ...API_ROUTES.websockets });
    cy.intercept(API_ROUTES.check.route).as('checkUserRoute');
    cy.intercept(API_ROUTES.userInfo.route).as('userInfoRoute');
    cy.intercept(API_ROUTES.sbomProjectList.route).as('sbomProjectList');
    cy.intercept(API_ROUTES.submissionList.route).as('submissionList');

    // Login and navigate
    loginActions.loginWithCredAndSaveSession({ username, password });
    cy.visit(APPLICATION_ROUTES.sbom);

    // Wait for data
    cy.wait('@submissionList', NETWORK_WAIT_OPTS);
    cy.wait('@sbomProjectList', NETWORK_WAIT_OPTS);

    // Verify page loaded
    cy.url().should('contain', APPLICATION_ROUTES.sbom);
    cy.findByText(cyTranslate('sbomModule.sbomAppTitle')).should('exist');
    cy.findByText(cyTranslate('sbomModule.sbomAppDescription')).should('exist');
  });

  describe.skip('Platform Dropdown Filtering', () => {
    beforeEach(() => {
      sbomPageActions.openPlatformFilter();
    });

    it('shows only iOS apps when iOS selected', () => {
      sbomPageActions.selectPlatform(cyTranslate('iOS'));
      sbomPageActions.validateSbomAppRowsByPlatform('apple');
    });

    it('shows only Android apps when Android selected', () => {
      sbomPageActions.selectPlatform(cyTranslate('android'));
      sbomPageActions.validateSbomAppRowsByPlatform('android');
    });
  });

  describe.skip('Search Functionality', () => {
    beforeEach(() => {
      // Assert search input exists, is visible, and has the correct placeholder
      cy.findByTestId('sbomApp-searchInput')
        .should('exist')
        .and('be.visible')
        .and('have.attr', 'placeholder', cyTranslate('searchQuery'))
        .as('searchInput');
    });

    it('should filter result by package name', () => {
      cy.get('@searchInput').clear().type(SBOM_APP_SEARCH_QUERY);

      // Simulate loading state
      sbomPageActions.checkAndWaitForAppLoadingView();

      sbomPageActions
        .getAppTableRows()
        .should('have.length.greaterThan', 0)
        .each((row) => {
          cy.wrap(row).within(() => {
            cy.findByText(new RegExp(SBOM_APP_SEARCH_QUERY, 'i')).should(
              'exist'
            );
          });
        });
    });

    it('should restore results when search is cleared', () => {
      cy.get('@searchInput').type(SBOM_APP_SEARCH_QUERY);

      sbomPageActions.checkAndWaitForAppLoadingView();

      // Get intercepted request length
      cy.wait('@sbomProjectList', NETWORK_WAIT_OPTS)
        .its('response.body.count')
        .as('initialApiRequestCount');

      sbomPageActions.getAppTableRows().its('length').as('initialAppTableRows');

      // Clear search input
      cy.get('@searchInput').clear();

      sbomPageActions.checkAndWaitForAppLoadingView();

      cy.wait('@sbomProjectList', NETWORK_WAIT_OPTS)
        .its('response.body.count')
        .as('newApiRequestCount');

      sbomPageActions.getAppTableRows().its('length').as('newAppTableRows');

      // Check if new app table rows are greater than initial app table rows
      cy.get('@initialAppTableRows').then((initialAppTableRows) => {
        cy.get('@newAppTableRows').should(
          'be.greaterThan',
          initialAppTableRows
        );
      });

      // Check network request count is greater than initial app table rows
      cy.get('@initialApiRequestCount').then((initialApiRequestCount) => {
        cy.get('@newApiRequestCount').should(
          'be.greaterThan',
          initialApiRequestCount
        );
      });
    });

    it('should show empty state when search has no results', () => {
      const INVALID_APP_SEARCH_QUERY = 'this-app-does-not-exist-123';

      cy.get('@searchInput').type(INVALID_APP_SEARCH_QUERY);

      sbomPageActions.checkAndWaitForAppLoadingView();

      cy.findByTestId('sbomApp-table').should('not.exist');

      cy.findByTestId('sbomApp-emptyTextContainer')
        .should('be.visible')
        .within(() => {
          cy.findByText(
            cyTranslate('sbomModule.sbomAppEmptyText.title')
          ).should('exist');

          cy.findByText(
            cyTranslate('sbomModule.sbomAppEmptyText.description')
          ).should('exist');
        });
    });
  });

  describe.skip('SBOM Report Flow', () => {
    beforeEach(() => {
      cy.intercept('GET', API_ROUTES.uploadApp.route).as('uploadAppReq');
      cy.intercept('POST', API_ROUTES.uploadApp.route).as('uploadAppReqPOST');
      cy.intercept('GET', API_ROUTES.sbomProjectList.route).as(
        'sbomProjectListReload'
      );
    });

    const uploadAppActions = new UploadAppActions();

    it('opens Past SBOM Analyses and validates report generation flow', () => {
      uploadAppActions.initiateViaSystemUpload('MFVA.apk');
      cy.wait(30000); //wait for SBOM report generation

      sbomPageActions.openActionMenu(0);
      sbomPageActions.selectAction('Past SBOM Analyses');

      sbomPageActions.validatePastSbomAnalysesPage();

      sbomPageActions.openViewReport(0);
      sbomPageActions.generateReportIfRequired();
      sbomPageActions.validateReportGenerated();
    });
  });

  describe('SBOM Report Detail Page', () => {
    it('opens SBOM detail page and validates overview + metadata', () => {
      // Intercept SBOM file summary API call
      cy.intercept(API_ROUTES.sbomFileSummary.route).as('sbomFileSummary');

      // Search for a particular app
      cy.findByTestId('sbomApp-searchInput').as('searchInput');
      cy.get('@searchInput').type(SBOM_MFVA_APP_SEARCH_QUERY);

      sbomPageActions.checkAndWaitForAppLoadingView();
      sbomPageActions.selectAppFromTableRow(SBOM_MFVA_APP_SEARCH_QUERY);

      sbomPageActions.validateOComponentDetailsOverviewCounts(
        '@sbomFileSummary'
      );

      // TODO: Continue with the rest of the test
      sbomPageActions.validateMetadataDynamic();

      //default tree view
      sbomPageActions.validateDefaultTreeView();

      //  Switch to List View
      sbomPageActions.switchToListViewAndValidate();

      // ===== Component Type Filter (List View) =====

      const componentTypes = ['Library', 'Framework', 'File', 'ML Model'];

      componentTypes.forEach((type) => {
        sbomPageActions.openComponentTypeFilter();
        sbomPageActions.selectComponentType(type);
        cy.get('body').click(0, 0);

        // sbomPageActions.validateFilteredByComponentTypeOrEmpty(type);
        sbomPageActions.validateFilteredListOrEmptyState();

        sbomPageActions.openComponentTypeFilter();
        sbomPageActions.clearComponentTypeFilterOnly();
      });
      // ===== Dependency Type Filter (List View) =====
      const dependencyTypes = ['Direct', 'Transitive'];

      dependencyTypes.forEach((type) => {
        sbomPageActions.openDependencyTypeFilter();
        sbomPageActions.selectDependencyType(type);
        cy.get('body').click(0, 0);

        sbomPageActions.validateFilteredListOrEmptyState();

        sbomPageActions.openDependencyTypeFilter();
        sbomPageActions.clearDependencyTypeFilterOnly();
      });

      //   Switch back to Tree View
      sbomPageActions.switchBackToTreeView();

      cy.get('[data-test-component-tree-nodelabel]').should(
        'have.length.greaterThan',
        0
      );

      //  Expand a tree node
      sbomPageActions.expandTreeNodeAndValidate();

      // Open a component
      sbomPageActions.openFirstComponent();

      // Validate Component Details page
      sbomPageActions.validateComponentDetailsPage();

      // Navigate back using breadcrumb
      sbomPageActions.navigateBackToSbomFromBreadcrumb();

      // Collapse all nodes
      sbomPageActions.collapseAllAndValidate();
    });
  });

  describe.skip('SBOM Page - Pagination Tests', () => {
    const paginationLabel = '[data-test-page-range]';
    const nextBtn = '[data-test-pagination-next-btn]';
    const prevBtn = '[data-test-pagination-prev-btn]';
    const rowSelector = 'sbomApp-table';

    beforeEach(() => {
      networkActions.hideNetworkLogsFor({ ...API_ROUTES.websockets });
      cy.intercept(API_ROUTES.check.route).as('checkUserRoute');
      cy.intercept(API_ROUTES.userInfo.route).as('userInfoRoute');
      cy.intercept(API_ROUTES.sbomProjectList.route).as('sbomProjectList');
      cy.intercept(API_ROUTES.submissionList.route).as('submissionList');

      loginActions.loginWithCredAndSaveSession({ username, password });
      cy.visit(APPLICATION_ROUTES.sbom);

      cy.wait('@sbomProjectList', { timeout: 40000 });

      cy.contains('SBOM', { timeout: 10000 }).should('exist');
    });

    describe.skip('Navigation - Next/Previous', () => {
      it('should navigate to next page and verify data changed', () => {
        cy.get(paginationLabel)
          .invoke('text')
          .then(() => {
            cy.findByTestId(rowSelector)
              .find('tbody tr')
              .first()
              .invoke('text', { timeout: 30000 })
              .then((initialRowData) => {
                cy.get(nextBtn).should('not.be.disabled').click();

                cy.findByTestId(rowSelector, { timeout: 30000 }).should(
                  'have.length.greaterThan',
                  0
                );

                cy.get(paginationLabel)
                  .invoke('text')
                  .then((text) => {
                    const normalized = text.replace(/\s+/g, ' ').trim();
                    expect(normalized).to.match(/\d+-\d+ of \d+/);
                  });

                cy.findByTestId(rowSelector)
                  .find('tbody tr')
                  .first()
                  .invoke('text')
                  .should('not.equal', initialRowData);

                cy.get(prevBtn).should('not.be.disabled').click();
              });
          });
      });

      it('should disable Previous button on first page', () => {
        cy.get(prevBtn).should('be.disabled');
      });
    });

    describe.skip('Button States', () => {
      it('should enable/disable buttons correctly during navigation', () => {
        cy.get(prevBtn).should('be.disabled');
        cy.get(nextBtn).should('not.be.disabled');

        // Go to Page 2
        cy.get(nextBtn).click();
        cy.findByTestId(rowSelector, { timeout: 30000 }).should(
          'have.length.greaterThan',
          0
        );

        // Wait for pagination label to change (confirms Page 2)
        cy.get(paginationLabel).invoke('text').as('page2Label');

        cy.get(prevBtn).should('not.be.disabled').click();

        //  WAIT for page to actually change
        cy.get(paginationLabel)
          .invoke('text')
          .should('not.equal', cy.get('@page2Label')); // Wait until label changes

        cy.findByTestId(rowSelector, { timeout: 30000 }).should(
          'have.length.greaterThan',
          0
        );
      });
    });

    describe.skip('Row Count & Data', () => {
      it('should maintain consistent row count per page', () => {
        cy.findByTestId(rowSelector).then(() => {
          cy.get(nextBtn).click();

          cy.findByTestId(rowSelector, { timeout: 30000 }).should(
            'have.length.greaterThan',
            0
          );

          cy.findByTestId(rowSelector).should('have.length.greaterThan', 0);
        });
      });
    });

    describe.skip('URL State', () => {
      it('should update URL when changing pages', () => {
        cy.url().then((page1Url) => {
          cy.get(nextBtn).click();
          cy.findByTestId(rowSelector, { timeout: 30000 }).should(
            'have.length.greaterThan',
            0
          );

          cy.url().should('not.equal', page1Url);
        });
      });
    });
  });
});
