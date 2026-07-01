import LoginActions from '../support/Actions/auth/LoginActions';
import NetworkActions from '../support/Actions/common/NetworkActions';
import { API_ROUTES } from '../support/api.routes';
import { APPLICATION_ROUTES } from '../support/application.routes';
import SbomPageActions from '../support/Actions/common/SbomPageActions';
import UploadAppActions from '../support/Actions/common/UploadAppActions';
import cyTranslate from '../support/translations';
import { WS_MODEL_UPDATED_PAYLOAD_MAP } from '../support/Websocket';
import { MirageFactoryDefProps } from '../support/Mirage';

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

  describe('Platform Dropdown Filtering', () => {
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

  describe('Search Functionality', () => {
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
        cy.get('@newAppTableRows').should('be.gte', initialAppTableRows);
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

  describe('SBOM Report Flow', () => {
    beforeEach(() => {
      cy.intercept('GET', API_ROUTES.uploadApp.route).as('uploadAppReq');
      cy.intercept('POST', API_ROUTES.uploadApp.route).as('uploadAppReqPOST');
    });

    const uploadAppActions = new UploadAppActions();

    it('opens Past SBOM Analyses and validates report generation flow', () => {
      cy.intercept('GET', API_ROUTES.sbomPdfDownload.route).as('sbPdfDownload');

      cy.intercept('GET', API_ROUTES.sbCycloneDxJsonDownload.route).as(
        'sbCycloneDxJsonDownload'
      );

      uploadAppActions.initiateViaSystemUpload('MFVA.apk');

      let uploadSubmissionID: number | null = null;

      // Intercept submission model updated event and get the uploaded file ID
      cy.interceptWsMessage<
        | WS_MODEL_UPDATED_PAYLOAD_MAP['submission']['payload']
        | WS_MODEL_UPDATED_PAYLOAD_MAP['file']['payload']
      >((event, payload) => {
        if (
          event === 'model_updated' &&
          payload?.model_name === 'submission' &&
          payload?.data?.status === 7 &&
          payload?.data?.file !== null
        ) {
          uploadSubmissionID = payload.data.id;
        }

        if (
          uploadSubmissionID &&
          payload?.model_name === 'file' &&
          payload?.data?.submission === uploadSubmissionID
        ) {
          cy.wrap(payload?.data).as('uploadedFile');
          cy.wrap(payload?.data?.project).as('uploadedAppPrjID');

          return true;
        }

        return false;
      });

      // Wait for the uploaded file details to be available from the websocket intercept
      cy.reload();

      cy.wait('@sbomProjectList', NETWORK_WAIT_OPTS);

      // Find the uploaded file in the SBOM project list
      cy.get('@sbomProjectList')
        .its('response.body.results')
        .then((results: Array<MirageFactoryDefProps['sbom-project']>) => {
          cy.get<number>('@uploadedAppPrjID').then((uploadedAppPrjID) => {
            const sbomProjectRow = results.find(
              (r) => r.project === uploadedAppPrjID
            );

            if (sbomProjectRow) {
              cy.wrap(sbomProjectRow.id).as('uploadedAppSBPrjId');
            }
          });
        });

      cy.get<number>('@uploadedAppSBPrjId').then((sbPrjID) => {
        cy.findByTestId(`sbomApp-row-${sbPrjID}`)
          .findByTestId('sbomApp-actionBtn')
          .click({ force: true });
      });

      // Validate Past SBOM Analyses page
      const pastAnalysesText = cyTranslate('sbomModule.pastSbomAnalyses');

      cy.findByLabelText('sbom app action menu item')
        .contains(pastAnalysesText)
        .should('be.visible')
        .click({ force: true });

      cy.findAllByTestId('sbomScan-row').should('have.length.greaterThan', 0);
      cy.findByText(pastAnalysesText).should('be.visible');

      // Wait for SBOM Scan to complete
      cy.wait(5000);

      // open the first (latest) report in the list
      cy.findAllByTestId('sbomScan-viewReportBtn', { timeout: 10000 })
        .first()
        .should('be.visible')
        .click({ force: true });

      cy.findAllByTestId('sbomReportList-reportGenerateBtn')
        .should('not.be.disabled')
        .click({ force: true });

      cy.findByText(
        cyTranslate('fileReport.detailedReport', { reportType: 'pdf' }),
        NETWORK_WAIT_OPTS
      ).should('be.visible');

      cy.findByText(
        cyTranslate('sbomModule.sbomDownloadPdfPrimaryText')
      ).should('be.visible');

      // Validate report is generated successfully
      cy.findByTestId('sbomReportList-loading').should('not.exist');
      cy.findByTestId('sbomReportList-reportGenerateBtn').should('not.exist');

      cy.findAllByTestId(/sbomReportList-reportDownloadBtn/).should(
        'have.length.at.least',
        2
      );

      // Download PDF report
      sbomPageActions.downloadSBOMAppReport('pdf');

      cy.wait('@sbPdfDownload', { timeout: 30000 })
        .its('response.statusCode')
        .should('equal', 200);

      // Download JSON
      sbomPageActions.downloadSBOMAppReport('cyclonedx_json_file');

      cy.wait('@sbCycloneDxJsonDownload', { timeout: 30000 })
        .its('response.statusCode')
        .should('equal', 200);
    });
  });

  describe('SBOM Report Detail Page', () => {
    beforeEach(() => {
      cy.intercept(API_ROUTES.sbomFileSummary.route).as('sbomFileSummary');

      cy.intercept(API_ROUTES.sbomFileComponents.route).as(
        'sbomFileComponents'
      );

      cy.intercept(API_ROUTES.sbomComponent.route).as('sbomComponent');

      sbomPageActions.navigateToSbomDetailPage(SBOM_MFVA_APP_SEARCH_QUERY);

      cy.wait('@sbomFileSummary', NETWORK_WAIT_OPTS);
    });

    it('validates overview counts from API response', () => {
      sbomPageActions.validateOComponentDetailsOverviewCounts(
        '@sbomFileSummary'
      );
    });

    it('validates metadata section from API response', () => {
      sbomPageActions.validateMetadataDynamic('@sbomFileComponents');
    });

    it('validates default tree view state on page load', () => {
      // Tree nodes are rendered
      sbomPageActions.componentLinks().should('have.length.greaterThan', 0);

      // collapse all button is visible but disabled on initial load since all nodes are already collapsed
      sbomPageActions.collapseAllBtn().should('be.disabled');
    });

    describe('List View - Filters', () => {
      beforeEach(() => {
        // Switch to list view and wait for component data
        cy.findByTestId('sbom-scan-details-list-view-btn').click();
        cy.wait('@sbomFileComponents', NETWORK_WAIT_OPTS);
      });

      it('filters rows by each component type', () => {
        const componentTypes = [
          cyTranslate('library'),
          cyTranslate('framework'),
          cyTranslate('file'),
          cyTranslate('sbomModule.mlModel'),
        ];

        componentTypes.forEach((type) => {
          sbomPageActions.openComponentTypeFilter();
          sbomPageActions.selectComponentType(type);

          cy.get('body').click(0, 0);

          sbomPageActions.validateFilteredSBOMComponentRows(type);
          sbomPageActions.openComponentTypeFilter();
          sbomPageActions.clearComponentTypeFilterOnly();
        });
      });

      it('filters rows by each dependency type', () => {
        const dependencyTypes = ['Direct', 'Transitive'] as const;

        dependencyTypes.forEach((type) => {
          sbomPageActions.openDependencyTypeFilter();
          sbomPageActions.selectDependencyType(type);

          cy.get('body').click(0, 0);

          sbomPageActions.validateFilteredSBOMComponentRows(type);
          sbomPageActions.openDependencyTypeFilter();
          sbomPageActions.clearDependencyTypeFilterOnly();
        });
      });
    });

    describe('Tree View - Expand & Component Details', () => {
      it('expands a tree node and enables collapse all, then collapses all', () => {
        sbomPageActions.expandNodeIcon().should('be.visible').click();

        // Node expanded — collapse all should now be enabled
        sbomPageActions.collapseAllBtn().should('not.be.disabled');
        sbomPageActions.collapseAllBtn().click({ force: true });

        // All collapsed — back to disabled
        sbomPageActions.collapseAllBtn().should('be.disabled');
      });

      it('opens component details, validates tabs and dynamic status, navigates back via breadcrumb', () => {
        sbomPageActions.expandNodeIcon().should('be.visible').click();
        sbomPageActions.componentLinks().first().click({ force: true });

        // Wait for component API before asserting
        cy.wait('@sbomComponent', NETWORK_WAIT_OPTS);

        // Tabs visible
        // HBS: data-test-sbomComponentDetails-tab='{{item.id}}'
        (['overview', 'vulnerabilities'] as const).forEach((tabId) => {
          sbomPageActions.componentDetailsTab(tabId).should('be.visible');
        });

        // Summary fields visible
        const summaryFieldLabels = [
          'sbomModule.componentType',
          'dependencyType',
          'status',
        ] as const;

        summaryFieldLabels.forEach((tabId) => {
          sbomPageActions
            .componentSummary(cyTranslate(tabId))
            .should('be.visible');
        });

        sbomPageActions
          .componentStatus(cyTranslate('chipStatus.secure'))
          .should('exist');

        // Navigate back via breadcrumb
        cy.findByText(
          new RegExp(
            cyTranslate('sbomModule.allComponentsAndVulnerabilities'),
            'i'
          )
        )
          .should('be.visible')
          .click();

        // Back on detail page — tree view button confirms correct page
        cy.findByTestId('sbom-scan-details-tree-view-btn').should('be.visible');
      });
    });
  });

  describe('SBOM Page - Pagination Tests', () => {
    beforeEach(() => {
      cy.findByLabelText('pagination previous button').as('prevBtn');
      cy.findByLabelText('pagination next button').as('nextBtn');

      sbomPageActions.getAppTableRows().first().as('firstRow');
    });

    describe('Navigation - Next/Previous', () => {
      it('should navigate to next page and verify data changed', () => {
        cy.get('@firstRow').invoke('text').as('initialFirstRow');
        cy.get('@nextBtn').should('not.be.disabled').click();
        cy.wait('@sbomProjectList', NETWORK_WAIT_OPTS);

        sbomPageActions.getAppTableRows().should('have.length.greaterThan', 0);

        cy.get('@sbomProjectList')
          .its('response.body.count')
          .then((totalCount) => {
            cy.findByLabelText('pagination page range')
              .invoke('text')
              .should((text) => {
                const normalized = text.replace(/\s+/g, ' ').trim();
                expect(normalized).to.match(/^\d+-\d+/);
                expect(normalized).to.include(`of ${totalCount} Apps`);
              });
          });

        cy.get('@firstRow')
          .invoke('text')
          .then((newFirstRow) => {
            cy.get('@initialFirstRow').should('not.equal', newFirstRow);
          });

        cy.get('@prevBtn').should('not.be.disabled');
      });

      it('should disable Previous button on first page', () => {
        cy.get('@prevBtn').should('be.disabled');
      });
    });

    describe('Button States', () => {
      it('should enable/disable buttons correctly during navigation', () => {
        cy.get('@prevBtn').should('be.disabled');
        cy.get('@nextBtn').should('not.be.disabled').click();

        cy.wait('@sbomProjectList', NETWORK_WAIT_OPTS);

        sbomPageActions.getAppTableRows().should('have.length.greaterThan', 0);

        cy.get('@prevBtn').should('not.be.disabled');
      });
    });

    [25, 50].forEach((itemsPerPage) => {
      describe('Items Per Page', () => {
        it(`should update rows and URL when items per page is changed to ${itemsPerPage}`, () => {
          cy.findByLabelText('pagination item per page options').click();
          cy.findByRole('option', { name: `${itemsPerPage}` }).click();

          cy.wait('@sbomProjectList', NETWORK_WAIT_OPTS);

          cy.url().should('include', `app_limit=${itemsPerPage}`);

          sbomPageActions
            .getAppTableRows()
            .should('have.length.greaterThan', 0);

          cy.get('@sbomProjectList')
            .its('response.body.count')
            .then((totalCount) => {
              const expectedEnd = Math.min(itemsPerPage, totalCount);

              cy.findByLabelText('pagination page range')
                .should('exist')
                .invoke('text')
                .should((text) => {
                  const normalized = text.replace(/\s+/g, ' ').trim();

                  expect(normalized).to.match(new RegExp(`^1-${expectedEnd}`));
                  expect(normalized).to.include(`of ${totalCount} Apps`);
                });
            });
        });
      });
    });

    describe('URL State', () => {
      it('should update URL when changing pages', () => {
        cy.url().then((page1Url) => {
          cy.get('@nextBtn').click();

          cy.wait('@sbomProjectList', NETWORK_WAIT_OPTS);

          cy.url().should('not.equal', page1Url);

          sbomPageActions
            .getAppTableRows()
            .should('have.length.greaterThan', 0);
        });
      });
    });
  });
});
