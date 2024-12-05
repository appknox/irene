import { click, render } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import styles from 'irene/components/app-monitoring/details/index.scss';

module('Integration | Component | app-monitoring/details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');

    const file = this.server.create('file');

    const project = this.server.create('project', {
      last_file_id: file.id,
    });

    // Am App version
    const amAppVersion = this.server.create('am-app-version', {
      id: 1,
      latest_file: file.id,
    });

    this.setProperties({
      file,
      project,
      latestAmAppVersion: amAppVersion,
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(req.params.id).toJSON();
    });

    this.server.get('/v2/am_app_syncs/:id', (schema, req) => {
      return schema.amAppSyncs.find(req.params.id).toJSON();
    });
  });

  test('it renders with the right app data', async function (assert) {
    // Am app version
    const amAppVersion = this.server.create('am-app-version', {
      id: 1,
      latest_file: this.file.id,
    });

    // Am App record
    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      latest_am_app_version: amAppVersion.id,
      is_active: true,
      monitoring_enabled: true,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());
    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`<AppMonitoring::Details @amApp={{this.amApp}} />`);

    assert.dom('[data-test-app-details-container]').exists();
    assert.dom('[data-test-appLogo-img]').exists();

    const lastFile = this.amApp.project.get('lastFile');
    const iconElement = document.querySelector('[data-test-appLogo-img]');

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
      .hasText(t('appMonitoringModule.latestScannedVersion'));

    assert
      .dom('[data-test-app-latest-scanned-version]')
      .exists()
      .hasText(`${lastFile.get('comparableVersion')}`);

    // Since settings is enabled
    assert
      .dom('[data-test-app-monitoring-status]')
      .exists()
      .hasText(t('activeCapital'));
  });

  test('it renders monitored date if amApp has a lastSynced date', async function (assert) {
    // Last sync is available for "NOT FOUND", "SCANNED", and "NOT SCANNED" Statuses
    const amAppSync = this.server.create('am-app-sync', {
      id: 1,
      synced_on: '2023-02-23T12:30:30.126797Z',
    });

    // Am App record
    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      latest_am_app_version: this.latestAmAppVersion.id,
      is_active: true,
      monitoring_enabled: true,
      last_sync: amAppSync.id,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());
    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`<AppMonitoring::Details @amApp={{this.amApp}} />`);

    assert
      .dom('[data-test-app-last-monitored-date-desc]')
      .exists()
      .containsText(t('appMonitoringModule.lastMonitoredOn'));

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
      .containsText(t('appMonitoringModule.syncInProgress'));
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
      [true, 'activeCapital'],
      [false, 'inactiveCapital'],
    ],
    async function (assert, [status, statusTextKey]) {
      const statusText = t(statusTextKey);

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
      ['monitoring-details', 'appMonitoringModule.monitoringDetails'],
      ['monitoring-history', 'appMonitoringModule.monitoringHistory'],
    ],
    async function (assert, [tabId, tabLabelKey]) {
      const tabLabel = t(tabLabelKey);

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

  test.each(
    'monitoring status toggle',
    [true, false],
    async function (assert, orgMonitoringEnabled) {
      assert.expect(orgMonitoringEnabled ? 7 : 5);

      this.set('settings', {
        id: 1,
        enabled: orgMonitoringEnabled,
      });

      this.server.patch('/v2/am_apps/:id', (schema, req) => {
        const { monitoring_enabled } = JSON.parse(req.requestBody);

        if (orgMonitoringEnabled) {
          assert.notOk(monitoring_enabled);
        }

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
        is_active: true,
        monitoring_enabled: true,
      });

      const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());
      this.amApp = this.store.push(normalizedAmApp);

      await render(
        hbs`<AppMonitoring::Details @amApp={{this.amApp}} @amOrgSettings={{this.settings}} />`
      );

      assert
        .dom('[data-test-app-monitoring-status-toggle-text]')
        .exists()
        .containsText(t('appMonitoringModule.monitoringStatus'));

      const monitoringStatusToggle =
        '[data-test-app-monitoring-toggle] [data-test-toggle-input]';

      if (orgMonitoringEnabled) {
        // App is checked by default
        assert.dom(monitoringStatusToggle).exists().isChecked();

        await click(monitoringStatusToggle);

        assert.dom(monitoringStatusToggle).exists().isNotChecked();
      } else {
        // Toggling is disabled at app level when org level monitoring is disabled
        assert.dom(monitoringStatusToggle).exists().isChecked().isDisabled();
      }
    }
  );
});
