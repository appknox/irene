import { click, render } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import styles from 'irene/components/app-monitoring/details/index.scss';

module('Integration | Component | app-monitoring/details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');

    const fileRecord = this.server.create('file');

    const file = this.store.push(
      this.store.normalize('file', fileRecord.toJSON())
    );

    // Project
    const projectRecord = this.server.create('project', {
      last_file_id: file.id,
    });

    const project = this.store.push(
      this.store.normalize('project', projectRecord.toJSON())
    );

    // Am App version
    const amAppVersion = this.server.create('am-app-version', {
      id: 1,
      latest_file: file.id,
    });

    const normalizedAmAppVersion = this.store.normalize(
      'am-app-version',
      amAppVersion.toJSON()
    );

    this.setProperties({
      file,
      project,
      latestAmAppVersion: this.store.push(normalizedAmAppVersion),
    });
  });

  test('it renders with the right app data', async function (assert) {
    // Am app version
    const amAppVersion = this.server.create('am-app-version', {
      id: 1,
      latest_file: this.file.id,
    });

    const normalizedAmAppVersion = this.store.normalize(
      'am-app-version',
      amAppVersion.toJSON()
    );

    this.amAppVersion = this.store.push(normalizedAmAppVersion);

    // Am App record
    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      latest_am_app_version: this.amAppVersion.id,
      is_active: true,
      monitoring_enabled: true,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());
    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`<AppMonitoring::Details @amApp={{this.amApp}} />`);

    assert.dom('[data-test-app-details-container]').exists();
    assert.dom('[data-test-app-icon-url]').exists();

    const lastFile = this.amApp.project.get('lastFile');
    const iconElement = document.querySelector('[data-test-app-icon-url]');

    assert.strictEqual(
      iconElement.src,
      lastFile.get('iconUrl'),
      'Renders the correct app icon'
    );

    assert.dom('[data-test-app-name]').hasText(`${lastFile.get('name')}`);

    assert
      .dom('[data-test-app-namespace]')
      .hasText(`${this.amApp.project.get('packageName')}`);

    assert
      .dom('[data-test-app-platform]')
      .exists()
      .hasClass(
        styles[`platform-${this.amApp.project.get('platformIconClass')}`]
      );

    assert.dom('[data-test-app-file-id]').containsText(`${lastFile.get('id')}`);

    assert
      .dom('[data-test-app-latest-scanned-version-desc]')
      .exists()
      .hasText('t:appMonitoringModule.latestScannedVersion:()');

    assert
      .dom('[data-test-app-latest-scanned-version]')
      .exists()
      .hasText(`${lastFile.get('comparableVersion')}`);

    // Since settings is enabled
    assert
      .dom('[data-test-app-monitoring-status]')
      .exists()
      .hasText('t:activeCapital:()');
  });

  test('it renders monitored date if amApp has a lastSynced date', async function (assert) {
    // Last sync is available for "NOT FOUND", "SCANNED", and "NOT SCANNED" Statuses
    const amAppSync = this.server.create('am-app-sync', {
      id: 1,
      synced_on: '2023-02-23T12:30:30.126797Z',
    });

    const normalizedAmAppSync = this.store.normalize(
      'am-app-sync',
      amAppSync.toJSON()
    );

    this.lastSync = this.store.push(normalizedAmAppSync);

    // Am App record
    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      latest_am_app_version: this.latestAmAppVersion.id,
      is_active: true,
      monitoring_enabled: true,
      last_sync: this.lastSync.id,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());
    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`<AppMonitoring::Details @amApp={{this.amApp}} />`);

    assert
      .dom('[data-test-app-last-monitored-date-desc]')
      .exists()
      .containsText('t:appMonitoringModule.lastMonitoredOn:()');

    assert
      .dom('[data-test-app-last-monitored-date]')
      .exists()
      .containsText(
        `${new dayjs(this.amApp.lastSync.get('syncedOn')).format(
          'DD MMM YYYY'
        )}`
      );
  });

  test('it renders loading state as monitored date if amApp has no last synced date and monitoring status is "ACTIVE"', async function (assert) {
    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      latest_am_app_version: this.latestAmAppVersion.id,
      last_sync: null,
      is_active: true,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());
    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`<AppMonitoring::Details @amApp={{this.amApp}} />`);

    assert
      .dom('[data-test-app-last-monitored-date] [data-test-ak-loader]')
      .exists();

    assert
      .dom('[data-test-app-last-monitored-date-pending-text]')
      .exists()
      .containsText('t:appMonitoringModule.syncInProgress:()');
  });

  test('it renders empty monitoring date if amApp has no last synced date and monitoring status is "INACTIVE"', async function (assert) {
    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      latest_am_app_version: this.latestAmAppVersion.id,
      last_sync: null,
      is_active: false,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());
    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`<AppMonitoring::Details @amApp={{this.amApp}} />`);

    assert
      .dom('[data-test-app-last-monitored-date]')
      .exists()
      .containsText('---');
  });

  test.each(
    'it renders the right monitoring status based on the monitoring state',
    [
      [true, 't:activeCapital:()'],
      [false, 't:inactiveCapital:()'],
    ],
    async function (assert, [status, statusText]) {
      const amApp = this.server.create('am-app', {
        id: 1,
        project: this.project.id,
        latest_am_app_version: this.latestAmAppVersion.id,
        last_sync: null,
        is_active: status,
      });

      const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());
      this.amApp = this.store.push(normalizedAmApp);

      await render(hbs`<AppMonitoring::Details @amApp={{this.amApp}} />`);

      assert
        .dom('[data-test-app-monitoring-status]')
        .exists()
        .hasText(statusText);
    }
  );

  test.each(
    'it renders the history and details tabs',
    [
      ['monitoring-details', 't:appMonitoringModule.monitoringDetails:()'],
      ['monitoring-history', 't:appMonitoringModule.monitoringHistory:()'],
    ],
    async function (assert, [tabId, tabLabel]) {
      const amApp = this.server.create('am-app', {
        id: 1,
        project: this.project.id,
        latest_am_app_version: this.latestAmAppVersion.id,
        last_sync: null,
      });

      const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());
      this.amApp = this.store.push(normalizedAmApp);

      await render(hbs`<AppMonitoring::Details @amApp={{this.amApp}} />`);

      assert
        .dom(`[data-test-app-details-tabs='${tabId}-tab']`)
        .exists()
        .hasText(tabLabel);
    }
  );

  test('it toggles monitoring status', async function (assert) {
    assert.expect(7);

    this.server.patch('/v2/am_apps/:id', (schema, req) => {
      const { monitoring_enabled } = JSON.parse(req.requestBody);

      assert.ok(monitoring_enabled);

      return {
        ...schema.amApps.find(`${req.params.id}`)?.toJSON(),
        monitoring_enabled,
      };
    });

    // AmApp Record
    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      latest_am_app_version: this.latestAmAppVersion.id,
      is_active: false,
      monitoring_enabled: false,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());
    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`<AppMonitoring::Details @amApp={{this.amApp}} />`);

    assert
      .dom('[data-test-app-monitoring-action-text]')
      .exists()
      .containsText('t:appMonitoringModule.monitoringAction:()');

    assert
      .dom('[data-test-app-monitoring-toggle] [data-test-toggle-input]')
      .exists()
      .isNotChecked();

    await click('[data-test-app-monitoring-toggle] [data-test-toggle-input]');

    assert
      .dom('[data-test-app-monitoring-toggle] [data-test-toggle-input]')
      .exists()
      .isChecked();
  });
});
