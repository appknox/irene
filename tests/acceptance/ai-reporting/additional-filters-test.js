import {
  visit,
  find,
  click,
  waitFor,
  fillIn,
  findAll,
} from '@ember/test-helpers';

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { calendarSelect } from 'ember-power-calendar/test-support/helpers';
import dayjs from 'dayjs';
import Service from '@ember/service';

import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';

import * as AI_REPORT_UTILS from '../../helpers/ai-generate-report-utils';

import {
  assertAkSelectTriggerExists,
  chooseAkSelectOption,
} from '../../helpers/mirage-utils';

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
module('Acceptance | ai-reporting/additional-filters', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupBrowserFakes(hooks, { window: true });

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
   * ASSERTION HELPERS
   * =================================
   */

  // Check that the table data is correct
  const assertReportTableDataItems = (
    assert,
    testReportDataElements = [],
    testReportData = [],
    testColumns = []
  ) => {
    testReportDataElements.forEach((rowElement, idx) => {
      testColumns.forEach((column) => {
        const columnValue = AI_REPORT_UTILS.getDisplayValue(
          testReportData[idx],
          column
        );

        assert.dom(rowElement).exists().containsText(`${columnValue}`);
      });
    });
  };

  const assertEmptyFilterGroup = (assert, filterGroupContainer) => {
    assert
      .dom(
        '[data-test-aiReporting-preview-filterByColumnDrawer-emptyFilterGroupContainer]',
        filterGroupContainer
      )
      .exists();

    assert
      .dom(
        '[data-test-aiReporting-preview-filterByColumnDrawer-emptyFilterGroupText]',
        filterGroupContainer
      )
      .hasText(t('reportModule.advancedFilters.noFiltersSelected'));

    assert
      .dom(
        '[data-test-aiReporting-preview-filterByColumnDrawer-emptyFilterGroupAddFilterBtn]',
        filterGroupContainer
      )
      .hasText(t('reportModule.advancedFilters.addFilter'));

    assert
      .dom(
        '[data-test-aiReporting-preview-filterByColumnDrawer-emptyFilterGroupAddFilterBtnIcon]',
        filterGroupContainer
      )
      .exists();
  };

  // Check that all filter groups are empty
  const assertAllFilterGroupsAreEmpty = (assert, mockFilterGroups) => {
    mockFilterGroups.forEach((filterGroup) => {
      const filterGroupContainer = find(
        `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroup="${filterGroup.id}"]`
      );

      assert.dom(filterGroupContainer).exists();

      assert
        .dom(
          '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupLabel]',
          filterGroupContainer
        )
        .containsText(filterGroup.model_name);

      // Groups should be empty
      assertEmptyFilterGroup(assert, filterGroupContainer);
    });
  };

  // Assert filter button has correct number of applied filters
  const assertFilterBtnAppliedFiltersCount = (assert, appliedFilterCount) => {
    assert
      .dom('[data-test-aiReporting-preview-advancedFilterBtn]')
      .containsText(
        String(appliedFilterCount),
        'Has correct number of applied filters'
      );
  };

  /**
   * =================================
   * TEST: EMPTY STATE
   * =================================
   */
  test('filter: empty state', async function (assert) {
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

    assert
      .dom('[data-test-aiReporting-preview-advancedFilterBtn]')
      .containsText('0')
      .containsText(t('reportModule.advancedFilter'))
      .isNotDisabled();

    assert.dom('[data-test-aiReporting-preview-advancedFilterIcon]').exists();

    await click('[data-test-aiReporting-preview-advancedFilterBtn]');

    assert.dom('[data-test-aiReporting-preview-filterByColumnDrawer]').exists();

    assert
      .dom('[data-test-aiReporting-preview-filterByColumnDrawer-heading]')
      .hasText(t('reportModule.advancedFilter'));

    assert
      .dom(
        '[data-test-aiReporting-preview-filterByColumnDrawer-contentHeading]'
      )
      .hasText(t('reportModule.advancedFilters.customiseReportData'));

    assert
      .dom(
        '[data-test-aiReporting-preview-filterByColumnDrawer-contentSubHeading]'
      )
      .hasText(t('reportModule.advancedFilters.selectFieldsToApplyFilters'));

    // Sanity check for filter groups
    assertAllFilterGroupsAreEmpty(assert, testData.filter_details);

    // Footer buttons
    assert
      .dom('[data-test-aiReporting-preview-filterByColumnDrawer-clearAllBtn]')
      .containsText(t('clearFilters'))
      .isNotDisabled();

    assert
      .dom('[data-test-aiReporting-preview-filterByColumnDrawer-applyBtn]')
      .containsText(t('apply'))
      .isNotDisabled();

    assert
      .dom('[data-test-aiReporting-preview-filterByColumnDrawer-cancelBtn]')
      .containsText(t('cancel'))
      .isNotDisabled();
  });

  /**
   * =================================
   * TEST: APPLY ADDITIONAL FILTERS
   * =================================
   */

  test('add, apply, and remove filters correctly', async function (assert) {
    assert.expect();

    const previewTitle = 'Example Report';
    const DATA_COUNT = 5;
    const testData = AI_REPORT_UTILS.generateTestData(DATA_COUNT);
    const mockFilterGroups = testData.filter_details;

    let selectedFiltersInfo = []; // To be updated with selected filters
    const pkgNameFilterVal = testData.data[0]?.package_name;

    const reportRequest = this.server.create('ai-reporting/report-request', {
      is_relevant: true,
    });

    // Server mock
    this.server.post(
      '/ai_reporting/report_request/:id/preview',
      (schema, request) => {
        const reqBody = JSON.parse(request.requestBody);
        const reqAdditionalFilters = reqBody.additional_filters;
        const resData = testData;

        if (selectedFiltersInfo.length > 0) {
          JSON.parse(reqAdditionalFilters).forEach((filter) => {
            const selectedFilter = selectedFiltersInfo.find(
              (sf) => sf.id === filter.id
            );

            assert.strictEqual(
              selectedFilter.filter_details,
              filter.filter_details
            );
          });
        }

        // Apply only package_name filter, if available.
        const pkgNameFilterGroup = reqAdditionalFilters.find((filter) =>
          Object.keys(filter.filter_details).find(
            (key) => key === 'package_name'
          )
        );

        if (pkgNameFilterGroup) {
          const pkgNameFilterVal =
            pkgNameFilterGroup.filter_details.package_name.value;

          const pkgNameFilterValData = resData.data.filter(
            (data) => data.package_name === pkgNameFilterVal
          );

          resData.data = pkgNameFilterValData;
        }

        return { ...resData, title: previewTitle };
      }
    );

    await visit(`/dashboard/reports/preview/${reportRequest.id}`);

    // Wait for API response
    await waitFor('[data-test-aiReporting-preview-title]', { timeout: 300 });

    /* =================================
     * ADD FILTERS FLOW
     * =================================
     */

    // Assert that the filter button has 0 applied filters
    assertFilterBtnAppliedFiltersCount(assert, 0);

    // Open Advanced Filter Drawer
    await click('[data-test-aiReporting-preview-advancedFilterBtn]');

    // Check that all filter groups are empty
    assertAllFilterGroupsAreEmpty(assert, mockFilterGroups);

    // Add a filter to each filter group
    for (let i = 0; i < mockFilterGroups.length; i++) {
      const filterGroup = mockFilterGroups[i];

      const firstFilterGroupContainer = find(
        `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroup="${filterGroup.id}"]`
      );

      const addFilterBtn = firstFilterGroupContainer.querySelector(
        '[data-test-aiReporting-preview-filterByColumnDrawer-emptyFilterGroupAddFilterBtn]'
      );

      assert.dom(firstFilterGroupContainer).exists();

      // clicking on Add filter btn adds the first filter in the fields
      await click(addFilterBtn);

      // Check that the correct filter is added
      const groupFields = filterGroup.fields;
      const firstFilterGroupItem = groupFields[0];

      const firstFilterGroupItemElement = find(
        `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupItem="${filterGroup.id}-0"]`
      );

      assert.dom(firstFilterGroupItemElement).exists();

      assert
        .dom(
          '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupItemIndicator]',
          firstFilterGroupItemElement
        )
        .hasText(t('reportModule.advancedFilters.where'));

      // Assert select trigger for filter field
      assertAkSelectTriggerExists(
        assert,
        `.${firstFilterGroupItem.field}-filter-group-item-field-select`
      );

      // Assert select trigger for filter field operator
      const operatorTriggerClass = `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupContent-field-filterOperatorSelectKey="${firstFilterGroupItem.field}"]`;

      assertAkSelectTriggerExists(assert, operatorTriggerClass);

      await chooseAkSelectOption({
        selectTriggerClass: operatorTriggerClass,
        optionIndex: 0, // Equals operator === "eq"
      });

      // Filter details
      const commonFilterDetails = { operator: 'eq' };

      // Boolean field types have only two constant choices
      // This is manually being added since no choices are returned for boolean field types
      firstFilterGroupItem.choices =
        firstFilterGroupItem.type === ENUMS.AI_REPORTING_FIELD_TYPE.BOOLEAN
          ? [
              ['True', 'true'],
              ['False', 'false'],
            ]
          : firstFilterGroupItem.choices;

      // Check that the correct filter fields value component is rendered
      if (firstFilterGroupItem?.choices) {
        const choiceTypeTriggerClass = `.${firstFilterGroupItem.field}-filter-group-item-field-choice-select`;
        const labelToSelect = firstFilterGroupItem.choices[0][0];

        // Choice type values
        assertAkSelectTriggerExists(assert, choiceTypeTriggerClass);

        // Choose first option
        await chooseAkSelectOption({
          selectTriggerClass: choiceTypeTriggerClass,
          labelToSelect,
        });

        selectedFiltersInfo.push({
          id: filterGroup.id,
          filter_details: {
            [firstFilterGroupItem.field]: {
              ...commonFilterDetails,
              value: String(labelToSelect),
            },
          },
        });
      } else if (firstFilterGroupItem.type === 'datetime') {
        assert
          .dom(
            '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupContent-field-dateTypeSelect]',
            firstFilterGroupItemElement
          )
          .exists();

        // Pick a date
        const dateTriggerSelector =
          '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupContent-field-datePicker-toggleBtn]';

        const dateToSelect = new Date();
        const dateDisplayValue = dayjs(dateToSelect).format('DD MMM, YYYY');

        assert
          .dom(dateTriggerSelector)
          .hasText(t('reportModule.advancedFilters.selectDate'));

        assert.dom('[data-test-akDatePicker-calendar]').doesNotExist();

        // open date picker
        await click(dateTriggerSelector);

        assert.dom('[data-test-akDatePicker-calendar]').exists();

        await calendarSelect('[data-test-akDatePicker-calendar]', dateToSelect);

        assert.dom(dateTriggerSelector).containsText(dateDisplayValue);

        selectedFiltersInfo.push({
          id: filterGroup.id,
          filter_details: {
            [firstFilterGroupItem.field]: {
              ...commonFilterDetails,
              value: dayjs(dateToSelect).hour(0).minute(0).second(0).format(),
            },
          },
        });
      } else {
        const inputElement = firstFilterGroupItemElement.querySelector(
          '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupContent-field-textTypeInput]'
        );

        assert.dom(inputElement).exists();

        const isFloat = firstFilterGroupItem?.type === 'float';
        const isInt = firstFilterGroupItem?.type === 'integer';
        const isPackageName = firstFilterGroupItem?.field === 'package_name';

        const value = isPackageName
          ? pkgNameFilterVal // To a get a more streamlined result
          : isFloat
            ? '123.45'
            : isInt
              ? '123'
              : 'test';

        // Fill in the value
        await fillIn(inputElement, value);

        selectedFiltersInfo.push({
          id: filterGroup.id,
          filter_details: {
            [firstFilterGroupItem.field]: {
              ...commonFilterDetails,
              value,
            },
          },
        });
      }
    }

    // Close selected filter drawer
    await click(
      '[data-test-aiReporting-preview-filterByColumnDrawer-applyBtn]'
    );

    // Check that the applied filter count is correct
    assertFilterBtnAppliedFiltersCount(
      assert,
      Object.keys(selectedFiltersInfo).length
    );

    // Wait for table data to be rendered
    await waitFor('[data-test-aiReporting-preview-table-container]', {
      timeout: 300,
    });

    // Sanity check for table data after applying package_name filter
    const testReportData = testData.data;
    const testColumns = testData.columns.filter((col) => col.is_default); // Only selected columns are displayed

    // Table elements
    const reportColumns = findAll(
      '[data-test-aiReporting-preview-table-head] th'
    );

    let reportDataElements = findAll(
      '[data-test-aiReporting-preview-table-row]'
    );

    // Sanity check for columns
    assert.strictEqual(
      testColumns.length,
      reportColumns.length,
      'Column count matches'
    );

    testColumns.forEach((col, idx) =>
      assert.dom(reportColumns[idx]).containsText(col.label)
    );

    // Check row count
    assert.strictEqual(
      reportDataElements.length,
      testReportData.length,
      'Row count matches'
    );

    // Check row data
    assertReportTableDataItems(
      assert,
      reportDataElements,
      testReportData.filter((d) => d.package_name === pkgNameFilterVal),
      testColumns
    );

    /* =================================
     * DELETE FILTER FLOW
     * =================================
     */
    // Remove package_name filter
    await click('[data-test-aiReporting-preview-advancedFilterBtn]');

    const pkgNameFilterGrp = selectedFiltersInfo.find((filter) =>
      Object.keys(filter.filter_details).find((key) => key === 'package_name')
    );

    // Update selected filters for assertion in request interceptor
    selectedFiltersInfo = selectedFiltersInfo.filter(
      (filter) => filter.id !== pkgNameFilterGrp.id
    );

    const pkgNameFilterGrpContainer = find(
      `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroup="${pkgNameFilterGrp.id}"]`
    );

    const deleteFilterBtn = pkgNameFilterGrpContainer.querySelector(
      '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupItem-removeBtn]'
    );

    assert.dom(deleteFilterBtn).exists();

    await click(deleteFilterBtn);

    // Package name filter group should be empty since we add only one filter for that group
    assertEmptyFilterGroup(assert, pkgNameFilterGrpContainer);

    // Apply filters
    await click(
      '[data-test-aiReporting-preview-filterByColumnDrawer-applyBtn]'
    );

    await waitFor('[data-test-aiReporting-preview-table-container]', {
      timeout: 300,
    });

    // Check that the applied filter count in advanced filter button is correct
    assertFilterBtnAppliedFiltersCount(
      assert,
      Object.keys(selectedFiltersInfo).length
    );

    // Check that the table is rendering the complete data since we removed the package_name filter
    reportDataElements = findAll('[data-test-aiReporting-preview-table-row]');

    assertReportTableDataItems(
      assert,
      reportDataElements,
      testReportData,
      testColumns
    );

    /* =================================
     * CLEAR ALL FILTERS FLOW
     * =================================
     */

    // Open Advanced Filter Drawer
    await click('[data-test-aiReporting-preview-advancedFilterBtn]');

    // Clear all filters
    await click(
      '[data-test-aiReporting-preview-filterByColumnDrawer-clearAllBtn]'
    );

    selectedFiltersInfo = [];

    // Assert that all filter groups are empty
    assertAllFilterGroupsAreEmpty(assert, mockFilterGroups);

    // Apply filters
    await click(
      '[data-test-aiReporting-preview-filterByColumnDrawer-applyBtn]'
    );

    await waitFor('[data-test-aiReporting-preview-table-container]', {
      timeout: 300,
    });

    // Check that the table data is correct
    assert.strictEqual(
      reportDataElements.length,
      testReportData.length,
      'Row count matches'
    );

    // Assert that the filter button has 0 applied filters
    assertFilterBtnAppliedFiltersCount(assert, 0);

    // Check that the table data is correct
    reportDataElements = findAll('[data-test-aiReporting-preview-table-row]');

    assertReportTableDataItems(
      assert,
      reportDataElements,
      testReportData,
      testColumns
    );
  });

  /**
   * ================================
   * TEST: REPORT GENERATION
   * ================================
   */
  test('report generation: with additional filters', async function (assert) {
    assert.expect();

    const previewTitle = 'Example Report';
    const downloadUrl = `${ENV.host}/download`; // Keep URL in same origin so as to load blank content
    const DATA_COUNT = 5;
    const testData = AI_REPORT_UTILS.generateTestData(DATA_COUNT);
    const mockFilterGroups = testData.filter_details;
    let selectedFiltersInfo = [];

    const reportRequest = this.server.create('ai-reporting/report-request', {
      is_relevant: true,
      report_type: 'xlsx',
    });

    // Server mock
    this.server.post(
      '/ai_reporting/report_request/:id/preview',
      (schema, request) => {
        const reqBody = JSON.parse(request.requestBody);
        const reqAdditionalFilters = reqBody.additional_filters;
        const resData = testData;

        if (selectedFiltersInfo.length > 0) {
          // eslint-disable-next-line qunit/no-conditional-assertions
          assert.strictEqual(
            JSON.stringify(reqAdditionalFilters),
            JSON.stringify(selectedFiltersInfo)
          );
        }

        // Apply only package_name filter, if available.
        const pkgNameFilterGroup = reqAdditionalFilters.find((filter) =>
          Object.keys(filter.filter_details).find(
            (key) => key === 'package_name'
          )
        );

        if (pkgNameFilterGroup) {
          const pkgNameFilterVal =
            pkgNameFilterGroup.filter_details.package_name.value;

          const pkgNameFilterValData = resData.data.filter(
            (data) => data.package_name === pkgNameFilterVal
          );

          resData.data = pkgNameFilterValData;
        }

        return { ...resData, title: previewTitle };
      }
    );

    this.server.post(
      '/ai_reporting/report_request/:id/download_url',
      (schema, request) => {
        const reqBody = JSON.parse(request.requestBody);

        // Assert columns are selected
        assert.strictEqual(
          JSON.stringify(reqBody.columns),
          JSON.stringify(
            testData.columns
              .filter((column) => column.is_default)
              .map((column) => ({
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
          JSON.stringify(selectedFiltersInfo)
        );

        return { url: downloadUrl };
      }
    );

    await visit(`/dashboard/reports/preview/${reportRequest.id}`);

    // Wait for API response
    await waitFor('[data-test-aiReporting-preview-title]', { timeout: 300 });

    /* =================================
     * Add filters flow
     * =================================
     */

    // Assert that the filter button has 0 applied filters
    assertFilterBtnAppliedFiltersCount(assert, 0);

    // Open Advanced Filter Drawer
    await click('[data-test-aiReporting-preview-advancedFilterBtn]');

    // Check that all filter groups are empty
    assertAllFilterGroupsAreEmpty(assert, mockFilterGroups);

    // Add package_name filter
    let pkgNameFilter = {};

    const pkgNameFilterGrp = mockFilterGroups.find((fg) =>
      fg.fields.find((f) => {
        pkgNameFilter = f;

        return f.field === 'package_name';
      })
    );

    // Update selected filters for assertion in request interceptor
    const pkgNameFilterGrpContainer = find(
      `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroup="${pkgNameFilterGrp.id}"]`
    );

    // Add a filter to each filter group
    const addFilterBtn = pkgNameFilterGrpContainer.querySelector(
      '[data-test-aiReporting-preview-filterByColumnDrawer-emptyFilterGroupAddFilterBtn]'
    );

    assert.dom(pkgNameFilterGrpContainer).exists();

    // clicking on Add filter btn adds the first filter in the fields
    await click(addFilterBtn);

    // Check that the correct filter is added
    const pkgNameFilterVal = testData.data[0].package_name;

    const firstFilterGroupItemElement = find(
      `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupItem="${pkgNameFilterGrp.id}-0"]`
    );

    assert.dom(firstFilterGroupItemElement).exists();

    assert
      .dom(
        '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupItemIndicator]',
        firstFilterGroupItemElement
      )
      .hasText(t('reportModule.advancedFilters.where'));

    // Assert select trigger for filter field
    assertAkSelectTriggerExists(
      assert,
      `.${pkgNameFilter.field}-filter-group-item-field-select`
    );

    // Assert select trigger for filter field operator
    const operatorTriggerClass = `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupContent-field-filterOperatorSelectKey="${pkgNameFilter.field}"]`;

    // Assert and select the equals operator
    assertAkSelectTriggerExists(assert, operatorTriggerClass);

    await chooseAkSelectOption({
      selectTriggerClass: operatorTriggerClass,
      optionIndex: 0, // Equals operator === "eq"
    });

    // Update the value of the filter
    const inputElement = firstFilterGroupItemElement.querySelector(
      '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupContent-field-textTypeInput]'
    );

    assert.dom(inputElement).exists();

    // Fill in the value
    await fillIn(inputElement, pkgNameFilterVal);

    selectedFiltersInfo.push({
      id: pkgNameFilterGrp.id,
      filter_details: {
        [pkgNameFilter.field]: {
          operator: 'eq',
          value: pkgNameFilterVal,
        },
      },
    });

    // Close selected filter drawer
    await click(
      '[data-test-aiReporting-preview-filterByColumnDrawer-applyBtn]'
    );

    // Check that the applied filter count is correct
    assertFilterBtnAppliedFiltersCount(
      assert,
      Object.keys(selectedFiltersInfo).length
    );

    // Wait for table data to be rendered
    await waitFor('[data-test-aiReporting-preview-table-container]', {
      timeout: 300,
    });

    // Sanity check for table data after applying package_name filter
    const testReportData = testData.data;
    const testColumns = testData.columns.filter((col) => col.is_default); // Only selected columns are displayed

    // Table elements
    const reportColumns = findAll(
      '[data-test-aiReporting-preview-table-head] th'
    );

    let reportDataElements = findAll(
      '[data-test-aiReporting-preview-table-row]'
    );

    // Sanity check for columns
    assert.strictEqual(
      testColumns.length,
      reportColumns.length,
      'Column count matches'
    );

    testColumns.forEach((col, idx) =>
      assert.dom(reportColumns[idx]).containsText(col.label)
    );

    // Check row count
    assert.strictEqual(
      reportDataElements.length,
      testReportData.length,
      'Row count matches'
    );

    // Check row data
    assertReportTableDataItems(
      assert,
      reportDataElements,
      testReportData.filter((d) => d.package_name === pkgNameFilterVal),
      testColumns
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

    assert
      .dom('[data-test-aiReporting-preview-generateReport-button]')
      .hasText(t('downloadReport'))
      .isNotDisabled();

    // Check window service url
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
