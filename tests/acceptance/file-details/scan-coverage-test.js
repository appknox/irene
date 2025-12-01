import { click, find, findAll, visit, waitFor } from '@ember/test-helpers';

import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { Response } from 'miragejs';
import { setupIntl, t } from 'ember-intl/test-support';

import ENUMS from 'irene/enums';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

module('Acceptance | file-details/scan-coverage', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    // Store
    const store = this.owner.lookup('service:store');

    // Models
    const { organization } = await setupRequiredEndpoints(this.server);
    setupFileModelEndpoints(this.server);

    organization.update({
      features: {
        dynamicscan_automation: true,
      },
    });

    // Models
    const profile = this.server.create('profile');

    const file = this.server.create('file', {
      id: 1,
      project: '1',
      profile: profile.id,
      is_active: true,
      dev_framework: ENUMS.FILE_DEV_FRAMEWORK.ANDROID_NATIVE,
    });

    const project = this.server.create('project', {
      last_file: file,
      id: '1',
      active_profile_id: profile.id,
    });

    // server api interception
    this.server.get('/v2/server_configuration', () => ({}));
    this.server.get('/v2/dashboard_configuration', () => ({}));

    this.server.get('/v3/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v3/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/profiles/:id', (schema, req) =>
      schema.profiles.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/v2/dynamicscans/:id', (schema, req) => {
      return schema.dynamicscans.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id/dynamicscans', (schema, req) => {
      const { limit, mode } = req.queryParams || {};

      const results = schema.dynamicscans
        .where({
          file: req.params.id,
          ...(mode ? { mode: Number(mode) } : {}),
        })
        .models.slice(0, limit ? Number(limit) : results.length);

      return {
        count: results.length,
        next: null,
        previous: null,
        results,
      };
    });

    this.server.get('v2/profiles/:id/automation_preference', (_, req) => {
      return { id: req.params.id, dynamic_scan_automation_enabled: true };
    });

    this.server.get('/v2/files/:id/screen_coverage', (schema, req) => {
      return schema.scanCoverages.find(`${req.params.id}`)?.toJSON();
    });

    // Set properties
    this.setProperties({
      file: store.push(store.normalize('file', file.toJSON())),
      project: store.push(store.normalize('project', project.toJSON())),
      store,
    });
  });

  /**
   * ========================
   * TEST HELPERS
   * ========================
   */

  // Assert table data
  const assertTableData = (assert, screens) => {
    const allTableRows = findAll(
      '[data-test-fileDetailsDynamicScanResultsCoverageTable-row]'
    );

    assert.strictEqual(allTableRows.length, screens.length);

    allTableRows.forEach((tableRow, index) => {
      const screen = screens[index];

      assert.dom(tableRow).containsText(screen.identifier);

      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-results-coverageTable-status]',
          tableRow
        )
        .hasText(
          screen.visited
            ? t('scanCoverage.visitedCapitalized')
            : t('scanCoverage.notVisitedCapitalized')
        )
        .hasClass(screen.visited ? /success/ : /error/);
    });
  };

  // Open status filter
  const openStatusFilter = async () => {
    await click(
      '[data-test-fileDetailsDynamicScanResults-coverageTableStatusHeader-icon]'
    );
  };

  // Get status option radio element
  const getStatusOptionRadioElement = (status) =>
    find(
      `[data-test-fileDetailsDynamicScanResults-coverageTableStatusHeader-radio="${status}"]`
    );

  /**
   * ========================
   * TEST: COMPLETED STATUS
   * ========================
   */
  test('it renders scan coverage header and table data', async function (assert) {
    assert.expect(22);

    // Scan coverage screens
    const screens = this.server.createList('scan-coverage-screen', 5);
    const visitedScreens = screens.filter((screen) => screen.visited);

    // Scan coverage model
    const scan_coverage = this.server.create('scan-coverage', {
      status: ENUMS.SCAN_COVERAGE_STATUS.COMPLETED,
      is_any_screen_coverage_complete: true,
    });

    this.scanCoverage = this.store.push(
      this.store.normalize('scan-coverage', scan_coverage.toJSON())
    );

    this.scanCoverage.set('totalNumOfVisitedScreens', visitedScreens.length);
    this.scanCoverage.set('totalNumOfScreens', screens.length);

    // Server mocks
    this.server.get(
      '/v2/files/:id/app_screens',
      (schema) => {
        const appScreens = schema.scanCoverageScreens.all().models;

        return {
          count: appScreens.length,
          next: null,
          previous: null,
          results: appScreens,
        };
      },
      { timing: 150 }
    );

    await visit(
      `/dashboard/file/${this.file.id}/dynamic-scan/results/scan-coverage`
    );

    assert
      .dom('[data-test-fileDetails-dynamicScan-results-scanCoverage-container]')
      .exists();

    assert
      .dom(
        '[data-test-fileDetails-dynamicScan-results-scanCoverage-percentage]'
      )
      .hasText(
        t('scanCoverage.percentageDone', {
          percentage: this.scanCoverage.coverage,
        })
      );

    assert
      .dom(
        '[data-test-fileDetails-dynamicScan-results-scanCoverage-stats-screensCovered]'
      )
      .hasText(
        t('scanCoverage.screensCovered', {
          covered: this.scanCoverage.totalNumOfVisitedScreens,
          total: this.scanCoverage.totalNumOfScreens,
        })
      );

    assert
      .dom(
        '[data-test-fileDetails-dynamicScan-results-scanCoverage-stats-screensCoveredText]'
      )
      .hasText(t('scanCoverage.screensCoveredText'));

    // Coverage percentage bar
    assert
      .dom(
        `[data-test-ak-loader-linear-progress="${this.scanCoverage.coverage}"]`
      )
      .exists();

    // Sanity check for table data
    await waitFor(
      '[data-test-fileDetailsDynamicScanResultsCoverageTable-thead]',
      { timeout: 150 }
    );

    assert
      .dom('[data-test-fileDetailsDynamicScanResultsCoverageTable-thead]')
      .exists();

    const allTableRows = this.element.querySelectorAll(
      '[data-test-fileDetailsDynamicScanResultsCoverageTable-row]'
    );

    assert.strictEqual(allTableRows.length, screens.length);

    // Confirm table data rows
    allTableRows.forEach((tableRow, index) => {
      const screen = screens[index];

      assert.dom(tableRow).containsText(screen.identifier);

      assert
        .dom(
          `[data-test-fileDetails-dynamicScan-results-coverageTable-status]`,
          tableRow
        )
        .hasText(
          screen.visited
            ? t('scanCoverage.visitedCapitalized')
            : t('scanCoverage.notVisitedCapitalized')
        )
        .hasClass(screen.visited ? /success/ : /error/);
    });
  });

  /**
   * ========================
   * TEST: OTHER STATUSES
   * ========================
   */
  test.each(
    'it renders other statuses other than completed',
    [
      // Unsupported Dev Framework
      {
        devFramework: ENUMS.FILE_DEV_FRAMEWORK.ANDROID_FLUTTER,
        status: ENUMS.SCAN_COVERAGE_STATUS.COMPLETED,
        expect: 5,
      },

      // Supported Dev Framework
      // Only supported framework is Android Native as at the time of writing

      // In Progress
      {
        devFramework: ENUMS.FILE_DEV_FRAMEWORK.ANDROID_NATIVE,
        status: ENUMS.SCAN_COVERAGE_STATUS.CALCULATING_SCREEN_COVERAGE,
        expect: 4,
      },
      {
        devFramework: ENUMS.FILE_DEV_FRAMEWORK.ANDROID_NATIVE,
        status: ENUMS.SCAN_COVERAGE_STATUS.PROCESSING_DS_EVENTS,
        expect: 4,
      },
      {
        devFramework: ENUMS.FILE_DEV_FRAMEWORK.ANDROID_NATIVE,
        status: ENUMS.SCAN_COVERAGE_STATUS.GENERATING_APP_SCREENS,
        expect: 4,
      },

      // Errored
      {
        devFramework: ENUMS.FILE_DEV_FRAMEWORK.ANDROID_NATIVE,
        status: ENUMS.SCAN_COVERAGE_STATUS.ERROR,
        expect: 4,
      },

      // Coverage does not exist or is NOT STARTED
      {
        devFramework: ENUMS.FILE_DEV_FRAMEWORK.ANDROID_NATIVE,
        status: ENUMS.SCAN_COVERAGE_STATUS.NOT_STARTED,
        expect: 4,
      },
      {
        devFramework: ENUMS.FILE_DEV_FRAMEWORK.ANDROID_NATIVE,
        coverage: null,
        expect: 4,
      },
    ],
    async function (assert, { devFramework, status, coverage, expect }) {
      assert.expect(expect);

      this.file.set('devFramework', devFramework);

      const isCoverageNull = coverage === null;
      const scanCoverage = isCoverageNull
        ? null
        : this.server.create('scan-coverage', {
            status,
            is_any_screen_coverage_complete: false,
          });

      this.set(
        'scanCoverage',
        isCoverageNull
          ? null
          : this.store.push(
              this.store.normalize('scan-coverage', scanCoverage.toJSON())
            )
      );

      // Test start
      await visit(
        `/dashboard/file/${this.file.id}/dynamic-scan/results/scan-coverage`
      );

      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-results-scanCoverage-container]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-results-scanCoverage-status-container]'
        )
        .exists();

      // Status checks
      const coverageIsUnsupported = !this.file.screenCoverageSupported;
      const coverageIsErrored = this.scanCoverage?.coverageIsErrored;
      const coverageIsInProgress = this.scanCoverage?.coverageIsInProgress;

      const coverageIsNotStarted =
        this.scanCoverage === null || this.scanCoverage.coverageIsNotStarted;

      const statusTitle = coverageIsUnsupported
        ? t('scanCoverage.unsupported.title')
        : coverageIsInProgress
          ? t('scanCoverage.inProgressMsg')
          : coverageIsNotStarted
            ? t('scanCoverage.notStartedMsg')
            : t('scanCoverage.errorMsg');

      const statusSubtext = coverageIsUnsupported
        ? t('scanCoverage.unsupported.description')
        : '';

      // Status illustrations
      const statusIllustration =
        coverageIsUnsupported || coverageIsInProgress
          ? 'unsupported-svg'
          : coverageIsErrored
            ? 'errored-svg'
            : 'notStarted-svg';

      assert
        .dom(
          `[data-test-fileDetails-dynamicScan-results-scanCoverage-status-${statusIllustration}]`
        )
        .exists();

      // Status texts
      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-results-scanCoverage-status-text]'
        )
        .hasText(statusTitle);

      // Subtexts only exist for unsupported statuses
      if (statusSubtext) {
        assert
          .dom(
            '[data-test-fileDetails-dynamicScan-results-scanCoverage-status-subtext]'
          )
          .hasText(statusSubtext);
      }
    }
  );

  /**
   * ========================
   * TEST: FILTERS
   * ========================
   */
  test('apply filters to table data', async function (assert) {
    assert.expect(55);

    // Scan coverage screens
    const visitedScreens = this.server.createList('scan-coverage-screen', 3, {
      visited: true,
    });

    const notVisitedScreens = this.server.createList(
      'scan-coverage-screen',
      2,
      { visited: false }
    );

    const screens = [...visitedScreens, ...notVisitedScreens];

    // Scan coverage model
    const scan_coverage = this.server.create('scan-coverage', {
      status: ENUMS.SCAN_COVERAGE_STATUS.COMPLETED,
      is_any_screen_coverage_complete: true,
    });

    this.scanCoverage = this.store.push(
      this.store.normalize('scan-coverage', scan_coverage.toJSON())
    );

    this.scanCoverage.set('totalNumOfVisitedScreens', visitedScreens.length);
    this.scanCoverage.set('totalNumOfScreens', screens.length);

    // Server mocks
    this.server.get('/v2/files/:id/app_screens', (schema, request) => {
      const { visited } = request.queryParams;
      const appScreens = schema.scanCoverageScreens.all().models;
      let filteredScreens = appScreens;

      // Filter by visited status
      if (visited !== undefined) {
        filteredScreens = appScreens.filter((screen) =>
          visited === 'true' ? screen.visited : !screen.visited
        );
      }

      // Simulate empty filter results
      if (this.returnEmptyFilterList) {
        filteredScreens = [];
      }

      return {
        count: filteredScreens.length,
        next: null,
        previous: null,
        results: filteredScreens,
      };
    });

    // Test start
    await visit(
      `/dashboard/file/${this.file.id}/dynamic-scan/results/scan-coverage`
    );

    assert
      .dom('[data-test-fileDetails-dynamicScan-results-scanCoverage-container]')
      .exists();

    // Sanity check for table data
    assert
      .dom('[data-test-fileDetailsDynamicScanResultsCoverageTable-thead]')
      .exists();

    // Confirm table data rows
    assertTableData(assert, screens);

    await openStatusFilter();

    assert
      .dom(
        '[data-test-fileDetailsDynamicScanResults-coverageTableStatusHeader-popover]'
      )
      .exists();

    assert
      .dom(
        '[data-test-fileDetailsDynamicScanResults-coverageTableStatusHeader-popover-headerText]'
      )
      .hasText(t('status'));

    // Available status options
    const statusOptions = [
      t('all'),
      t('scanCoverage.visited'),
      t('scanCoverage.notVisited'),
    ];

    // Status options elements
    const statusOptionsElements = findAll(
      '[data-test-fileDetailsDynamicScanResults-coverageTableStatusHeader-option]'
    );

    assert.strictEqual(statusOptionsElements.length, statusOptions.length);

    statusOptions.forEach((status, index) => {
      const statusOptionElement = statusOptionsElements[index];
      const shouldBeChecked = index === 0; // Default checked option is 'All'

      const radioElement = getStatusOptionRadioElement(status);

      assert.dom(statusOptionElement).containsText(status);

      if (shouldBeChecked) {
        assert.dom(radioElement).isChecked();
      } else {
        assert.dom(radioElement).isNotChecked();
      }
    });

    // Select not visited status option
    let notVisitedStatusOpt = getStatusOptionRadioElement(statusOptions[2]);

    await click(notVisitedStatusOpt);

    assert.dom(notVisitedStatusOpt).isChecked();

    // Assert table data
    assertTableData(assert, notVisitedScreens);

    // Clear filter
    await openStatusFilter();

    await click(
      '[data-test-fileDetailsDynamicScanResults-coverageTableStatusHeader-clearFilter-text]'
    );

    // Assert table data
    assertTableData(assert, screens);

    // Check new selected status option
    await openStatusFilter();

    const allScreensOption = getStatusOptionRadioElement(statusOptions[0]);
    notVisitedStatusOpt = getStatusOptionRadioElement(statusOptions[2]);

    assert.dom(notVisitedStatusOpt).isNotChecked();
    assert.dom(allScreensOption).isChecked();

    // Return empty filter list
    this.set('returnEmptyFilterList', true);

    // Select not visited status option
    const visitedStatusOpt = getStatusOptionRadioElement(statusOptions[1]);

    await click(visitedStatusOpt);

    assert.dom(visitedStatusOpt).isChecked();

    // Wait for empty filter results to be rendered
    assert.dom(
      '[data-test-fileDetailsDynamicScanResultsCoverageTable-emptyFilterResults-svg]'
    );

    assert
      .dom(
        '[data-test-fileDetailsDynamicScanResultsCoverageTable-emptyFilterResults]'
      )
      .containsText(t('scanCoverage.noFilterResults'));
  });

  test.each(
    'it renders the correct scan coverage status (old files and files with no DAST Scan)',
    [400, 410],
    async function (assert, status) {
      // Models
      this.file.set('devFramework', ENUMS.FILE_DEV_FRAMEWORK.UNKNOWN);

      // server mocks
      this.server.get('/v2/files/:id/screen_coverage', () => {
        return new Response(status, {}, {});
      });

      // Test start
      await visit(
        `/dashboard/file/${this.file.id}/dynamic-scan/results/scan-coverage`
      );

      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-results-scanCoverage-status-unsupported-svg]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-results-scanCoverage-status-text]'
        )
        .hasText(t('scanCoverage.unsupported.title'));

      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-results-scanCoverage-status-subtext]'
        )
        .hasText(t('scanCoverage.unsupported.description'));
    }
  );
});
