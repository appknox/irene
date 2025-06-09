import {
  visit,
  find,
  click,
  waitFor,
  findAll,
  triggerEvent,
} from '@ember/test-helpers';

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import Service from '@ember/service';

import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import ENV from 'irene/config/environment';

import * as AI_REPORT_UTILS from '../../helpers/ai-generate-report-utils';

// Notification Service
class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  setDefaultAutoClear() {}
}

class WindowStub extends Service {
  url = null;
  target = null;

  open(url, target) {
    this.url = url;
    this.target = target;
  }

  location = {
    href: ENV.host,

    replace: (url) => {
      this.url = url;
    },
  };

  removeEventListener = () => {};
  addEventListener = () => {};

  localStorage = {
    getItem: (key) => {
      return this[key];
    },

    setItem: (key, value) => {
      this[key] = value;
    },
  };

  sessionStorage = {
    getItem: (key) => {
      return this[key];
    },

    setItem: (key, value) => {
      this[key] = value;
    },
  };
}

// Test start
module('Acceptance | ai-reporting/preview', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    // Stubs
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:browser/window', WindowStub);

    // Server mocks
    this.server.get('/organizations/:id/ai_features', () => {
      return { reporting: true };
    });

    this.server.get('/ai_reporting/report_request/:id', (schema, request) => {
      return schema['aiReporting/reportRequests']
        .find(request.params.id)
        .toJSON();
    });

    // Setup required endpoints
    const { organization, currentOrganizationMe } =
      await setupRequiredEndpoints(this.server);

    // Update organization with AI features
    organization.update({ ai_features: { reporting: true } });

    this.setProperties({ currentOrganizationMe, organization });
  });

  /**
   * =================================
   * HELPER FUNCTIONS
   * =================================
   */

  // Get column container in drawer
  const getColumnContainer = (column) =>
    find(
      `[data-test-aiReporting-preview-filterByColumnDrawer-selectColumn="${column.field}"]`
    );

  // Assert column is selected
  const assertColIsSelected = (assert, colContainer) => {
    assert
      .dom(
        '[data-test-aiReporting-preview-filterByColumnDrawer-selectColumnCheckbox]',
        colContainer
      )
      .isChecked();
  };

  // Assert column is not selected
  const assertColIsNotSelected = (assert, colContainer) => {
    assert
      .dom(
        '[data-test-aiReporting-preview-filterByColumnDrawer-selectColumnCheckbox]',
        colContainer
      )
      .isNotChecked();
  };

  // Assert selected column count
  const assertSelectedColCount = (assert, count, allColumns) => {
    assert
      .dom(
        '[data-test-aiReporting-preview-filterByColumnDrawer-selectColsCountChip]'
      )
      .hasText(`(${count}/${allColumns.length}) ${t('selected')}`);
  };

  const moveColumnToAnotherPosition = async (colToMove, targetCol) => {
    // Mock dataTransfer object
    const dataTransfer = {
      data: {},

      setData(type, value) {
        this.data[type] = value;
      },

      getData(type) {
        return this.data[type] || '';
      },
    };

    const colToMoveContainer = getColumnContainer(colToMove);
    const targetColContainer = getColumnContainer(targetCol);

    await triggerEvent(colToMoveContainer, 'dragstart', { dataTransfer });
    await triggerEvent(targetColContainer, 'dragover', { dataTransfer });
    await triggerEvent(targetColContainer, 'drop', { dataTransfer });
    await triggerEvent(colToMoveContainer, 'dragend', { dataTransfer });
  };

  /**
   * =================================
   * TEST: REPORT PREVIEW WITH NO DATA
   * =================================
   */
  test.each(
    'it renders empty report preview',
    [{ relevant: true }, { relevant: false }, { relevant: false, error: true }],
    async function (assert, { relevant, error }) {
      assert.expect();

      const previewTitle = 'Example Report';

      const reportRequest = this.server.create('ai-reporting/report-request', {
        is_relevant: relevant,
        error: error,
      });

      // Server mock
      this.server.post('/ai_reporting/report_request/:id/preview', () => {
        return {
          title: previewTitle,
          columns: [],
          data: [],
          pagination: { count: 0, limit: 0, offset: 0 },
          filter_details: [],
        };
      });

      await visit(`/dashboard/reports/preview/${reportRequest.id}`);

      assert
        .dom('[data-test-aiReporting-preview-queryHeaderText]')
        .hasText(t('reportModule.reportQuery'));

      assert
        .dom('[data-test-aiReporting-preview-queryText]')
        .hasText(reportRequest.query);

      assert
        .dom('[data-test-aiReporting-preview-generateReport-button]')
        .containsText(t('downloadReport'))
        .isDisabled();

      // Relevant report displays report preview with no filters applied
      if (relevant) {
        await waitFor('[data-test-aiReporting-preview-title]', {
          timeout: 300,
        });

        assert
          .dom('[data-test-aiReporting-preview-title]')
          .hasText(previewTitle);

        assert
          .dom('[data-test-aiReporting-preview-defaultFilterNote]')
          .doesNotExist();

        assert.dom('[data-test-aiReporting-preview-filterButtons]').exists();

        assert
          .dom('[data-test-aiReporting-preview-selectedColumnsBtn]')
          .containsText(t('reportModule.selectedColumns'))
          .containsText('0'); // No filter applied

        assert
          .dom('[data-test-aiReporting-preview-advancedFilterBtn]')
          .containsText(t('reportModule.advancedFilter'))
          .containsText('0'); // No filter applied

        assert
          .dom('[data-test-aiReporting-preview-generateReport-button]')
          .hasText(t('downloadReport'));
      }
      // Non-relevant report displays error screens
      // with disabled filter buttons and report generation button
      else {
        await waitFor(
          '[data-test-aiReporting-preview-table-errorScreen-illustration]',
          { timeout: 300 }
        );

        assert.dom('[data-test-aiReporting-preview-title]').doesNotExist();

        assert
          .dom('[data-test-aiReporting-preview-table-errorScreen-container]')
          .exists();

        assert
          .dom('[data-test-aiReporting-preview-table-errorScreen-illustration]')
          .exists();

        assert
          .dom('[data-test-aiReporting-preview-selectedColumnsBtn]')
          .containsText(t('reportModule.selectedColumns'))
          .isDisabled();

        assert
          .dom('[data-test-aiReporting-preview-advancedFilterBtn]')
          .containsText(t('reportModule.advancedFilter'))
          .isDisabled();

        assert
          .dom('[data-test-aiReporting-preview-generateReport-button]')
          .containsText(t('downloadReport'))
          .isDisabled();

        const errorScreenHeader = error
          ? t('reportModule.somethingWentWrongHeader')
          : t('reportModule.rephrasingErrorHeader');

        const errorScreenDesc = error
          ? t('reportModule.somethingWentWrongDesc')
          : t('reportModule.rephrasingErrorDesc');

        assert
          .dom('[data-test-aiReporting-preview-table-errorScreenHeader]')
          .hasText(errorScreenHeader);

        assert
          .dom('[data-test-aiReporting-preview-table-errorScreenDesc]')
          .hasText(errorScreenDesc);
      }
    }
  );

  /**
   * =================================
   * TEST: REPORT PREVIEW WITH DATA
   * =================================
   */
  test('it renders report preview with data', async function (assert) {
    assert.expect();

    const previewTitle = 'Example Report';
    const DATA_COUNT = 5;
    const testData = AI_REPORT_UTILS.generateTestData(DATA_COUNT);

    const reportRequest = this.server.create('ai-reporting/report-request', {
      is_relevant: true,
    });

    // Server mock
    this.server.post('/ai_reporting/report_request/:id/preview', () => {
      return { ...testData, title: previewTitle };
    });

    await visit(`/dashboard/reports/preview/${reportRequest.id}`);

    // Wait for API response
    await waitFor('[data-test-aiReporting-preview-title]', {
      timeout: 300,
    });

    // Report title
    assert.dom('[data-test-aiReporting-preview-title]').hasText(previewTitle);

    assert
      .dom('[data-test-aiReporting-preview-queryHeaderText]')
      .hasText(t('reportModule.reportQuery'));

    assert
      .dom('[data-test-aiReporting-preview-queryText]')
      .hasText(reportRequest.query);

    // Check filter buttons are enabled
    assert
      .dom('[data-test-aiReporting-preview-selectedColumnsBtn]')
      .containsText(t('reportModule.selectedColumns'))
      .isNotDisabled();

    assert
      .dom('[data-test-aiReporting-preview-advancedFilterBtn]')
      .containsText(t('reportModule.advancedFilter'))
      .isNotDisabled();

    assert
      .dom('[data-test-aiReporting-preview-generateReport-button]')
      .containsText(t('downloadReport'))
      .isNotDisabled();

    // Check default column count is displayed on filter btn
    const defaultColumnCount = testData.columns.reduce(
      (acc, column) => (column.is_default ? acc + 1 : acc),
      0
    );

    assert
      .dom('[data-test-aiReporting-preview-selectedColumnsBtn]')
      .containsText(t('reportModule.selectedColumns'))
      .containsText(defaultColumnCount);

    // Sanity check for table data
    const testReportData = testData.data;
    const testColumns = testData.columns.filter((col) => col.is_default); // Only selected columns are displayed

    // Table elements
    const reportColumns = findAll(
      '[data-test-aiReporting-preview-table-head] th'
    );

    const reportDataElements = findAll(
      '[data-test-aiReporting-preview-table-row]'
    );

    // Sanity check for columns
    assert.strictEqual(
      testColumns.length,
      reportColumns.length,
      'Column count matches'
    );

    testColumns.forEach((col, idx) => {
      assert.dom(reportColumns[idx]).containsText(col.label);
    });

    // Check row count
    assert.strictEqual(
      reportDataElements.length,
      testReportData.length,
      'Row count matches'
    );

    // Check row data
    reportDataElements.forEach((rowElement, idx) => {
      testColumns.forEach((column) => {
        const columnValue = AI_REPORT_UTILS.getDisplayValue(
          testReportData[idx],
          column
        );

        assert.dom(rowElement).exists().containsText(`${columnValue}`);
      });
    });
  });

  /**
   * ================================
   * TEST: SELECT/DESELECT COLUMNS
   * ================================
   */
  test('filter: select/deselect columns', async function (assert) {
    assert.expect();

    const previewTitle = 'Example Report';
    const DATA_COUNT = 5;
    const testData = AI_REPORT_UTILS.generateTestData(DATA_COUNT);

    const reportRequest = this.server.create('ai-reporting/report-request', {
      is_relevant: true,
    });

    // Server mock
    this.server.post('/ai_reporting/report_request/:id/preview', () => {
      return { ...testData, title: previewTitle };
    });

    await visit(`/dashboard/reports/preview/${reportRequest.id}`);

    // Wait for API response
    await waitFor('[data-test-aiReporting-preview-title]', {
      timeout: 300,
    });

    // Selected col check
    const allColumns = testData.columns;
    const selectedColumns = allColumns.filter((c) => c.is_default);
    const unSelectedColumns = allColumns.filter((c) => !c.is_default);
    const noSelectedColumns = selectedColumns.length;

    // Check filter buttons are enabled
    assert
      .dom('[data-test-aiReporting-preview-selectedColumnsBtn]')
      .containsText(t('reportModule.selectedColumns'))
      .containsText(noSelectedColumns)
      .isNotDisabled();

    // Open filter by column drawer
    await click('[data-test-aiReporting-preview-selectedColumnsBtn]');

    // Check filter by column drawer is open
    assert.dom('[data-test-aiReporting-preview-filterByColumnDrawer]').exists();

    assert
      .dom('[data-test-aiReporting-preview-filterByColumnDrawer-title]')
      .hasText(t('reportModule.selectedColumns'));

    assert
      .dom('[data-test-aiReporting-preview-filterByColumnDrawer-close-btn]')
      .exists();

    assert
      .dom(
        '[data-test-aiReporting-preview-filterByColumnDrawer-reorderAddOrRemoveContainer]'
      )
      .exists();

    assert
      .dom(
        '[data-test-aiReporting-preview-filterByColumnDrawer-reorderAddOrRemoveHeader]'
      )
      .hasText(t('reportModule.addRemoveColumns'));

    // Assert selected column count
    assertSelectedColCount(assert, noSelectedColumns, allColumns);

    // Sanity check for selected/unselected cols
    allColumns.forEach((column) => {
      const colContainer = getColumnContainer(column);

      assert.dom(colContainer).containsText(column.label);

      // Assert column is selected
      if (column.selected) {
        assertColIsSelected(assert, colContainer);
      } else {
        assertColIsNotSelected(assert, colContainer);
      }
    });

    // Selects/Unselects a column. Selects 2 columns and unselects 1 column
    const col1ToSelect = unSelectedColumns[0];
    const col2ToSelect = unSelectedColumns[1];
    const colToUnselect = selectedColumns[0];
    const colsToToggle = [col1ToSelect, col2ToSelect, colToUnselect];

    // Toggle column status
    for (let index = 0; index < colsToToggle.length; index++) {
      const col = colsToToggle[index];
      const colContainer = getColumnContainer(col);
      const colIsSelected = col.selected;

      // Assert column status toggled
      if (colIsSelected) {
        assertColIsSelected(assert, colContainer);
      } else {
        assertColIsNotSelected(assert, colContainer);
      }

      // Click column checkbox
      await click(colContainer.querySelector('[data-test-checkbox]'));

      // Assert column status toggled
      if (colIsSelected) {
        assertColIsNotSelected(assert, colContainer);
      } else {
        assertColIsSelected(assert, colContainer);
      }
    }

    // No. of selected columns should increase by 1
    assertSelectedColCount(assert, noSelectedColumns + 1, allColumns);

    // Apply changes
    await click(
      '[data-test-aiReporting-preview-filterByColumnDrawer-applyBtn]'
    );

    assert
      .dom('[data-test-aiReporting-preview-selectedColumnsBtn]')
      .containsText(noSelectedColumns + 1);
  });

  /**
   * ================================
   * TEST: REORDER COLUMNS
   * ================================
   */
  test('filter: reorder and select all/unselect all columns', async function (assert) {
    assert.expect();

    const previewTitle = 'Example Report';
    const DATA_COUNT = 5;
    const testData = AI_REPORT_UTILS.generateTestData(DATA_COUNT); // Contains at least 1 selected

    const reportRequest = this.server.create('ai-reporting/report-request', {
      is_relevant: true,
    });

    // Server mock
    this.server.post('/ai_reporting/report_request/:id/preview', () => {
      return { ...testData, title: previewTitle };
    });

    await visit(`/dashboard/reports/preview/${reportRequest.id}`);

    // Wait for API response
    await waitFor('[data-test-aiReporting-preview-title]', {
      timeout: 300,
    });

    // Selected col check
    const allColumns = testData.columns;
    const selectedColumns = allColumns.filter((c) => c.is_default);
    const noSelectedColumns = selectedColumns.length;

    // Check filter buttons are enabled
    assert
      .dom('[data-test-aiReporting-preview-selectedColumnsBtn]')
      .containsText(t('reportModule.selectedColumns'))
      .containsText(noSelectedColumns)
      .isNotDisabled();

    // Open filter by column drawer
    await click('[data-test-aiReporting-preview-selectedColumnsBtn]');

    // Check filter by column drawer is open
    assert.dom('[data-test-aiReporting-preview-filterByColumnDrawer]').exists();

    // Assert selected column count
    assertSelectedColCount(assert, noSelectedColumns, allColumns);

    // Sanity check for selected/unselected cols
    allColumns.forEach((column) => {
      const colContainer = getColumnContainer(column);

      assert.dom(colContainer).containsText(column.label);

      // Assert column is selected
      if (column.selected) {
        assertColIsSelected(assert, colContainer);
      } else {
        assertColIsNotSelected(assert, colContainer);
      }
    });

    // Select All col
    await click(
      '[data-test-aiReporting-preview-filterByColumnDrawer-selectAllCheckbox]'
    );

    // All columns should be selected
    allColumns.forEach((column) => {
      const colContainer = getColumnContainer(column);

      assert.dom(colContainer).containsText(column.label);
      assertColIsSelected(assert, colContainer);
    });

    // Assert selected column count
    assertSelectedColCount(assert, allColumns.length, allColumns);

    // Unselect All col
    await click(
      '[data-test-aiReporting-preview-filterByColumnDrawer-selectAllCheckbox]'
    );

    // All columns should be unselected
    allColumns.forEach((column) => {
      const colContainer = getColumnContainer(column);

      assert.dom(colContainer).containsText(column.label);
      assertColIsNotSelected(assert, colContainer);
    });

    // Assert selected column count
    assertSelectedColCount(assert, 0, allColumns);

    assert
      .dom('[data-test-aiReporting-preview-filterByColumnDrawer-applyBtn]')
      .isDisabled();

    // Check column in correct order
    let columnElements = findAll(
      '[data-test-aiReporting-preview-filterByColumnDrawer-selectColumnItem]'
    );

    columnElements.forEach((elem, idx) =>
      assert.dom(elem).containsText(allColumns[idx].label)
    );

    // Confirm column reordering
    const col1 = allColumns[0];
    const col3 = allColumns[2];

    const lastCol = allColumns[allColumns.length - 1];
    const itemBeforeLastCol = allColumns[allColumns.length - 2];

    // Move col1 to col3
    await moveColumnToAnotherPosition(col1, col3);

    // Assert col1 is now in position 2
    columnElements = findAll(
      '[data-test-aiReporting-preview-filterByColumnDrawer-selectColumnItem]'
    );

    assert.dom(columnElements[2]).containsText(col1.label);

    // move last item before last col to last position
    await moveColumnToAnotherPosition(itemBeforeLastCol, lastCol);

    // Assert last item before last col is now in last position
    columnElements = findAll(
      '[data-test-aiReporting-preview-filterByColumnDrawer-selectColumnItem]'
    );

    assert
      .dom(columnElements[columnElements.length - 1])
      .containsText(itemBeforeLastCol.label);

    await click(
      '[data-test-aiReporting-preview-filterByColumnDrawer-selectAllCheckbox]'
    );

    // Apply changes
    await click(
      '[data-test-aiReporting-preview-filterByColumnDrawer-applyBtn]'
    );
  });

  /**
   * ================================
   * TEST: REPORT GENERATION
   * ================================
   */
  test('report generation: with columns filter', async function (assert) {
    assert.expect();

    // Test props
    const previewTitle = 'Example Report';
    const downloadUrl = `${ENV.host}/download`; // Keep URL in same origin so as to load blank content
    const DATA_COUNT = 5;
    const testData = AI_REPORT_UTILS.generateTestData(DATA_COUNT); // Contains at least 1 selected

    const reportRequest = this.server.create('ai-reporting/report-request', {
      is_relevant: true,
      report_type: 'xlsx',
    });

    // Server mock
    this.server.post('/ai_reporting/report_request/:id/preview', () => ({
      ...testData,
      title: previewTitle,
    }));

    this.server.post(
      '/ai_reporting/report_request/:id/download_url',
      (schema, request) => {
        const reqBody = JSON.parse(request.requestBody);

        // Assert columns are selected
        assert.strictEqual(
          JSON.stringify(reqBody.columns),
          JSON.stringify(
            allColumns.map((column) => ({
              label: column.name,
              field: column.field,
            }))
          )
        );

        // Assert report type
        assert.strictEqual(reqBody.report_type, reportRequest.report_type);

        // Assert additional filters
        assert.strictEqual(
          JSON.stringify(reqBody.additional_filters),
          JSON.stringify([])
        );

        return { url: downloadUrl };
      }
    );

    // Test Start
    await visit(`/dashboard/reports/preview/${reportRequest.id}`);

    // Wait for API response
    await waitFor('[data-test-aiReporting-preview-title]', { timeout: 300 });

    // Selected col check
    const allColumns = testData.columns;
    const selectedColumns = allColumns.filter((c) => c.is_default);
    const noSelectedColumns = selectedColumns.length;

    // Check filter buttons are enabled
    assert
      .dom('[data-test-aiReporting-preview-selectedColumnsBtn]')
      .containsText(t('reportModule.selectedColumns'))
      .containsText(noSelectedColumns)
      .isNotDisabled();

    // Open filter by column drawer
    await click('[data-test-aiReporting-preview-selectedColumnsBtn]');

    // Check filter by column drawer is open
    assert.dom('[data-test-aiReporting-preview-filterByColumnDrawer]').exists();

    // Assert selected column count
    assertSelectedColCount(assert, noSelectedColumns, allColumns);

    // Select All col
    await click(
      '[data-test-aiReporting-preview-filterByColumnDrawer-selectAllCheckbox]'
    );

    // Assert selected column count
    assertSelectedColCount(assert, allColumns.length, allColumns);

    // Apply changes
    await click(
      '[data-test-aiReporting-preview-filterByColumnDrawer-applyBtn]'
    );

    // Check iframe is present
    assert.dom('[data-test-aiReporting-preview-iframeWrapper]').isNotVisible();

    assert
      .dom('[data-test-aiReporting-preview-generateReport-button]')
      .containsText(t('downloadReport'));

    // Click download button
    await click('[data-test-aiReporting-preview-generateReport-button]');

    // Check report download drawer is open
    assert.dom('[data-test-aiReporting-preview-reportDownloadDrawer]').exists();

    assert
      .dom('[data-test-aiReporting-preview-reportDownloadDrawer-title]')
      .hasText(t('downloadReport'));

    assert
      .dom('[data-test-aiReporting-preview-reportDownloadDrawer-headerText]')
      .hasText(t('reportModule.aiReportDownloadHeaderText'));

    assert
      .dom('[data-test-aiReporting-preview-reportDownloadDrawer-reportList]')
      .exists();

    assert
      .dom('[data-test-aiReporting-preview-reportDownloadDrawer-downloadBtn]')
      .hasText(t('download'));

    // Assert report types
    const reportTypes = ['csv', 'xlsx'];

    reportTypes.forEach((reportType) => {
      const isDefaultReportType = reportType === reportRequest.report_type;

      const reportTypeContainer = find(
        `[data-test-aiReporting-preview-reportDownloadDrawer-reportItem-type="${reportType}"]`
      );

      const radioBtn = reportTypeContainer.querySelector(
        '[data-test-aiReporting-preview-reportDownloadDrawer-reportItem-radio]'
      );

      assert.dom(reportTypeContainer).exists();

      assert
        .dom(
          '[data-test-aiReporting-preview-reportDownloadDrawer-reportItem-primaryText]',
          reportTypeContainer
        )
        .hasText(t('reportModule.aiReportDownload', { reportType }));

      if (isDefaultReportType) {
        assert.dom(radioBtn).isChecked();
      } else {
        assert.dom(radioBtn).isNotChecked();
      }
    });

    // Confirm Download
    await click(
      '[data-test-aiReporting-preview-reportDownloadDrawer-downloadBtn]'
    );

    assert
      .dom('[data-test-aiReporting-preview-generateReport-button]')
      .hasText(t('reportModule.generating'))
      .isDisabled();

    await waitFor('[data-test-aiReporting-preview-generateReport-button]', {
      timeout: 300,
    });

    // Check download button is enabled
    assert
      .dom('[data-test-aiReporting-preview-generateReport-button]')
      .hasText(t('downloadReport'))
      .isNotDisabled();

    // Check download url is opened in another tab
    const windowService = this.owner.lookup('service:browser/window');

    assert.strictEqual(
      windowService.url,
      downloadUrl,
      'Correct download url is opened'
    );

    assert.strictEqual(
      windowService.target,
      '_blank',
      'Download url is opened in another tab'
    );
  });
});
