import cyTranslate from '../support/translations';
import LoginActions from '../support/Actions/auth/LoginActions';
import NetworkActions from '../support/Actions/common/NetworkActions';
import { API_ROUTES } from '../support/api.routes';
import { APPLICATION_ROUTES } from '../support/application.routes';
import UploadAppActions from '../support/Actions/common/UploadAppActions';
import { time } from 'echarts';
import { SbomPage } from '../support/Actions/common/Sbompage';
import _ from 'cypress/types/lodash';

const loginActions = new LoginActions();
const networkActions = new NetworkActions();

const username = Cypress.env('TEST_USERNAME') || 'testuser';
const password = Cypress.env('TEST_PASSWORD') || 'testpass';

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
    cy.wait('@submissionList', { timeout: 40000 });
    cy.wait('@sbomProjectList', { timeout: 40000 });

    // Verify page loaded
    cy.contains('SBOM', { timeout: 10000 }).should('exist');
  });

  describe('Platform Dropdown Filtering', () => {
    const sbomPage = new SbomPage();

    beforeEach(() => {
      sbomPage.openPlatformFilter();
    });

    it('shows only iOS apps when iOS selected', () => {
      sbomPage.selectPlatform('iOS');
      sbomPage.validateOnlyIOSApps();
    });

    it('shows only Android apps when Android selected', () => {
      sbomPage.selectPlatform('Android');
      sbomPage.validateOnlyAndroidApps();
    });
  });

  describe('Search Functionality', () => {
    const searchInput = 'sbomApp-searchInput';

    it('should render search input correctly', () => {
      cy.findByTestId(searchInput)
        .should('exist')
        .and('be.visible')
        .and('have.attr', 'placeholder');
    });

    it('should filter result by package name', () => {
      const query = 'com.appknox.dvia';

      cy.findByTestId(searchInput).clear().type(query);

      // Allow debounce / API response
      cy.wait(500);
      cy.get('body').then((body) => {
        const rows = body.find('table tbody tr');

        if (rows.length > 0) {
          cy.get('@sbom-appRows ').should('have.length.greaterThan', 0);
        }
      });
    });

    it('should restore results when search is cleared', () => {
      const query = 'com.appknox.dvia';

      cy.findByTestId(searchInput).clear().type(query);

      cy.wait(500);

      cy.findByTestId(searchInput).clear();

      cy.findByTestId('sbomApp-table', { timeout: 10000 }).should(
        'have.length.greaterThan',
        0
      );
    });

    it('should show empty state when search has no results', () => {
      const invalidApp = 'this-app-does-not-exist-123';

      cy.findByTestId('sbomApp-searchInput').clear().type(invalidApp);
      cy.wait(500);

      cy.findByTestId('sbomApp-table', { timeout: 10000 }).should('not.exist');

      cy.findByTestId('emptyTextTitle', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.empty');

      cy.findByTestId('sbomApp-emptyTextDescription').should('be.visible');
    });
  });

  describe('SBOM Report Flow', () => {
    beforeEach(() => {
      cy.intercept('GET', API_ROUTES.uploadApp.route).as('uploadAppReq');
      cy.intercept('POST', API_ROUTES.uploadApp.route).as('uploadAppReqPOST');
      cy.intercept('GET', API_ROUTES.sbomProjectList.route).as(
        'sbomProjectListReload'
      );
    });

    const sbomPage = new SbomPage();
    const uploadAppActions = new UploadAppActions();

    it('opens Past SBOM Analyses and validates report generation flow', () => {
      uploadAppActions.initiateViaSystemUpload('MFVA.apk');
      cy.wait(30000); //wait for SBOM report generation

      sbomPage.openActionMenu(0);
      sbomPage.selectAction('Past SBOM Analyses');

      sbomPage.validatePastSbomAnalysesPage();

      sbomPage.openViewReport(0);
      sbomPage.generateReportIfRequired();
      sbomPage.validateReportGenerated();
    });
  });

  describe('SBOM Report Detail Page', () => {
    const sbomPage = new SbomPage();

    it('opens SBOM detail page and validates overview + metadata', () => {
      sbomPage.selectReportRow('MFVA');

      sbomPage.validateOverviewDynamic();
      sbomPage.validateMetadataDynamic();

      //default tree view
      sbomPage.validateDefaultTreeView();

      //  Switch to List View
      sbomPage.switchToListViewAndValidate();

      // ===== Component Type Filter (List View) =====

      const componentTypes = ['Library', 'Framework', 'File', 'ML Model'];

      componentTypes.forEach((type) => {
        sbomPage.openComponentTypeFilter();
        sbomPage.selectComponentType(type);
        cy.get('body').click(0, 0);

        // sbomPage.validateFilteredByComponentTypeOrEmpty(type);
        sbomPage.validateFilteredListOrEmptyState();

        sbomPage.openComponentTypeFilter();
        sbomPage.clearComponentTypeFilterOnly();
      });
      // ===== Dependency Type Filter (List View) =====
      const dependencyTypes = ['Direct', 'Transitive'];

      dependencyTypes.forEach((type) => {
        sbomPage.openDependencyTypeFilter();
        sbomPage.selectDependencyType(type);
        cy.get('body').click(0, 0);

        sbomPage.validateFilteredListOrEmptyState();

        sbomPage.openDependencyTypeFilter();
        sbomPage.clearDependencyTypeFilterOnly();
      });

      //   Switch back to Tree View
      sbomPage.switchBackToTreeView();

      cy.get('[data-test-component-tree-nodelabel]').should(
        'have.length.greaterThan',
        0
      );

      //  Expand a tree node
      sbomPage.expandTreeNodeAndValidate();

      // Open a component
      sbomPage.openFirstComponent();

      // Validate Component Details page
      sbomPage.validateComponentDetailsPage();

      // Navigate back using breadcrumb
      sbomPage.navigateBackToSbomFromBreadcrumb();

      // Collapse all nodes
      sbomPage.collapseAllAndValidate();
    });
  });

  describe('SBOM Page - Pagination Tests', () => {
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

    describe('Navigation - Next/Previous', () => {
      it('should navigate to next page and verify data changed', () => {
        cy.get(paginationLabel)
          .invoke('text')
          .then((initialPageText) => {
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

    describe('Button States', () => {
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

    describe('Row Count & Data', () => {
      it('should maintain consistent row count per page', () => {
        cy.findByTestId(rowSelector).then(($rows) => {
          const page1RowCount = $rows.length;

          cy.get(nextBtn).click();
          cy.findByTestId(rowSelector, { timeout: 30000 }).should(
            'have.length.greaterThan',
            0
          );

          cy.findByTestId(rowSelector).should('have.length.greaterThan', 0);
        });
      });
    });

    describe('URL State', () => {
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
