import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { findAll, render, triggerEvent, waitFor } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';

module(
  'Integration | Component | app-monitoring/version-table',

  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.store = this.owner.lookup('service:store');

      const amAppStoreInstances = this.server.createList(
        'am-app-store-instance',
        2
      );

      const files = this.server.createList('file', 2);

      const project = files.map((file) =>
        this.server.create('project', { last_file_id: file.id })
      );

      const amAppSync = this.server.create('am-app-sync', 1);

      const amApp = this.server.create('am-app', {
        project: project.id,
        last_sync: amAppSync.id,
      });

      const amAppRecords = [];

      const amAppVersions = files.map((file, idx) => {
        const amAppVersion = this.server.create('am-app-version', {
          latest_file: faker.helpers.arrayElement([file.id, null]),
          am_app: amApp.id,
        });

        amAppRecords.push(
          this.server.create('am-app-record', {
            am_app_version: amAppVersion.id,
            am_app_store_instance: amAppStoreInstances[idx].id,
          })
        );

        return amAppVersion;
      });

      const normalized = this.store.normalize('am-app', amApp.toJSON());

      this.setProperties({
        project,
        amApp: this.store.push(normalized),
        amAppVersions,
        amAppStoreInstances,
        amAppRecords,
      });

      // Server mocks
      this.server.get('/v2/files/:id', (schema, req) => {
        return {
          ...schema.files.find(`${req.params.id}`)?.toJSON(),
          project: req.params.id,
        };
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_app_versions/:id', (schema, req) => {
        return schema.amAppVersions.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_apps/:id', (schema, req) => {
        return schema.amApps.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_app_syncs/:id', (schema, req) => {
        return schema.amAppSyncs.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_app_store_instances/:id', (schema, req) => {
        return schema.amAppStoreInstances.find(`${req.params.id}`)?.toJSON();
      });
    });

    test.each(
      'it renders amApp details loading and empty state',
      [
        [true, 'appMonitoringMessages.monitoringHistoryEmpty.body'],
        [false, 'appMonitoringMessages.monitoringDetailsEmpty.body'],
      ],
      async function (assert, [isHistoryTable, emptyMessageKey]) {
        const emptyMessage = t(emptyMessageKey);

        this.isHistoryTable = isHistoryTable;

        this.server.get(
          '/v2/am_apps/:amAppId/am_app_records',
          () => {
            return { count: 0, next: null, previous: null, results: [] };
          },
          { timing: 500 }
        );

        render(
          hbs`<AppMonitoring::VersionTable @amApp={{this.amApp}} @isHistoryTable={{this.isHistoryTable}} />`
        );

        await waitFor('[data-test-amVersionTable-container]', { timeout: 500 });

        assert
          .dom('[data-test-amVersionTable-loading]')
          .exists()
          .hasText(`${t('loading')}...`);

        await waitFor('[data-test-amVersionTable-empty]', { timeout: 500 });

        assert
          .dom('[data-test-am-emptyBodyText]')
          .exists()
          .hasText(emptyMessage);
      }
    );

    test('it renders pending state loader if amApp is "PENDING" and monitoring is "ACTIVE"', async function (assert) {
      this.server.get('/v2/am_apps/:amAppId/am_app_records', () => {
        return { count: 0, next: null, previous: null, results: [] };
      });

      const amApp = this.server.create('am-app', {
        project: this.project.id,
        last_sync: null,
        is_active: true,
      });

      const normalized = this.store.normalize('am-app', amApp.toJSON());
      this.amApp = this.store.push(normalized);

      await render(hbs`<AppMonitoring::VersionTable @amApp={{this.amApp}} />`);

      assert
        .dom('[data-test-amVersionTable-pendingStateLoader]')
        .exists()
        .hasText(t('appMonitoringMessages.pendingStateLoadingText'));
    });

    test.each(
      'it renders details table when atleast one amAppVersion exists and the amApp is not "PENDING"',
      [{ isHistoryTable: true }, { isHistoryTable: false }],
      async function (assert, { isHistoryTable }) {
        this.isHistoryTable = isHistoryTable;

        this.server.get('/v2/am_app_versions/:id/am_app_records', (schema) => {
          const results = schema.amAppRecords.all().models;

          return { count: 0, next: null, previous: null, results };
        });

        this.server.get('v2/am_apps/:id/am_app_versions', (schema) => {
          const results = schema.amAppVersions.all().models;

          return { count: 0, next: null, previous: null, results };
        });

        await render(
          hbs`<AppMonitoring::VersionTable @amApp={{this.amApp}} @isHistoryTable={{this.isHistoryTable}} />`
        );

        assert.dom('[data-test-amVersionTable]').exists();

        // Sanity Check for version table headers
        const versionTableHeaders = findAll(
          '[data-test-amVersionTable-header] th'
        );

        // History table has five(5) columns
        assert.strictEqual(versionTableHeaders.length, isHistoryTable ? 5 : 4);

        const tableHeaderTitles = [
          isHistoryTable ? t('appMonitoringModule.foundOn') : null,
          t('appMonitoringModule.storeVersion'),
          t('appMonitoringModule.appStatus'),
          t('appMonitoringModule.locatedIn'),
          t('action'),
        ].filter(Boolean);

        tableHeaderTitles.forEach((title, idx) => {
          assert.dom(versionTableHeaders[idx]).containsText(title);
        });

        // Tooltip check for the action column
        const actionColumnTooltipTrigger = versionTableHeaders[
          tableHeaderTitles.length - 1
        ].querySelector(
          '[data-test-amVersionTable-actionColumnHeader-tooltip]'
        );

        await triggerEvent(actionColumnTooltipTrigger, 'mouseenter');

        assert
          .dom('[data-test-amVersionTable-actionColumnHeader-tooltipContent]')
          .exists()
          .containsText(t('appMonitoringModule.actionsInfo'));

        // Rows check
        const amAppRecordRowElements = findAll(
          '[data-test-amVersionTable-row]'
        );

        assert.strictEqual(
          amAppRecordRowElements.length,
          this.amAppRecords.length,
          'renders the correct number of app versions'
        );

        // first row sanity check
        const firstRow = amAppRecordRowElements[0];
        const firstRowVersion = this.amAppVersions[0];
        const firstRowVersionLatestFile = this.amAppVersions[0]?.latest_file
          ? this.server.db.files.find(this.amAppVersions[0].latest_file)
          : null;

        // Checks for version row cells
        assert.dom(firstRow).exists();

        // Date found column only exists in history table
        if (isHistoryTable) {
          assert
            .dom('[data-test-amVersionTable-dateFound]', firstRow)
            .exists()
            .containsText(
              dayjs(firstRowVersion.created_on).format('Do MMM YYYY')
            );
        } else {
          assert
            .dom('[data-test-amVersionTable-dateFound]', firstRow)
            .doesNotExist();
        }

        // Version
        assert
          .dom('[data-test-amVersionTable-storeVersion]', firstRow)
          .exists()
          .containsText(firstRowVersion.display_version);

        // Countries
        const countries = this.amAppStoreInstances
          .map((record) => record.country_code)
          .join(', ');

        assert
          .dom('[data-test-details-table-countriesCodes]', firstRow)
          .exists()
          .containsText(countries);

        // Check for initiate scan button
        const firstRowIsScanned = !!firstRowVersionLatestFile;

        if (firstRowIsScanned) {
          assert
            .dom('[data-test-amVersionTable-noActionRequired]', firstRow)
            .exists()
            .containsText(t('noActionRequired'));
        }
        // Show button if unscanned
        else {
          assert
            .dom('[data-test-amVersionTable-initiateUploadBtn]', firstRow)
            .exists()
            .containsText(t('appMonitoringModule.initiateUpload'));
        }

        // Check for app scan status
        const transitionedFromUnscannedToScanned =
          !firstRowVersionLatestFile?.created_on
            ? false
            : dayjs(firstRowVersionLatestFile?.created_on).isAfter(
                firstRowVersion?.created_on
              );

        // Status Selectors
        const notScannedStatusSelector =
          '[data-test-amVersionTable-storeVersionStatus-notScanned]';

        const scannedStatusSelector =
          '[data-test-amVersionTable-storeVersionStatus-scanned]';

        const transitionArrowSelector =
          '[data-test-amVersionTable-storeVersion-transitionArrow]';

        const fileIDSelector = '[data-test-amVersionTable-storeVersion-fileID]';

        // Not Scanned and not transitioned
        if (!firstRowIsScanned && !transitionedFromUnscannedToScanned) {
          assert
            .dom(notScannedStatusSelector, firstRow)
            .exists()
            .containsText(t('notScanned'));

          assert.dom(transitionArrowSelector, firstRow).doesNotExist();
          assert.dom(scannedStatusSelector, firstRow).doesNotExist();
        }

        // Scanned and transitioned
        if (firstRowIsScanned && transitionedFromUnscannedToScanned) {
          assert
            .dom(notScannedStatusSelector, firstRow)
            .exists()
            .containsText(t('notScanned'));

          assert.dom(transitionArrowSelector, firstRow).exists();

          assert
            .dom(fileIDSelector, firstRow)
            .exists()
            .containsText(t('fileID'))
            .containsText(firstRowVersionLatestFile?.id);
        }

        // Scanned and not transitioned
        if (firstRowIsScanned && !transitionedFromUnscannedToScanned) {
          assert.dom(notScannedStatusSelector, firstRow).doesNotExist();
          assert.dom(transitionArrowSelector, firstRow).doesNotExist();

          assert
            .dom(fileIDSelector, firstRow)
            .exists()
            .containsText(t('fileID'))
            .containsText(firstRowVersionLatestFile?.id);

          assert
            .dom(scannedStatusSelector, firstRow)
            .exists()
            .containsText(t('scanned'));
        }
      }
    );
  }
);
