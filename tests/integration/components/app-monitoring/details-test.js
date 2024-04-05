import { render } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { faker } from '@faker-js/faker';
import styles from 'irene/components/app-monitoring/details/index.scss';

module('Integration | Component | app-monitoring/details', function (hooks) {
  setupRenderingTest(hooks);

  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');

    this.file = this.store.createRecord('file', {
      id: 1,
      iconUrl: faker.image.avatar(),
      name: faker.company.name(),
      version: '23.2.75',
      versionCode: '23.2.75',
    });

    this.latestAmAppVersion = this.store.createRecord('am-app-version', {
      id: 1,
    });

    this.project = this.store.createRecord('project', {
      id: 1,
      lastFile: this.file,
      platform: faker.helpers.arrayElement([0, 1]),
      packageName: 'package_name.com',
    });
  });

  test('it renders with the right app data', async function (assert) {
    this.latestAmAppVersion = this.store.createRecord('am-app-version', {
      id: 2,
      latestFile: this.file,
    });

    this.amApp = this.store.createRecord('am-app', {
      id: 1,
      project: this.project,
      latestAmAppVersion: this.latestAmAppVersion,
      isActive: true,
      monitoringEnabled: true,
    });

    await render(hbs`
      <AppMonitoring::Details @amApp={{this.amApp}} />
    `);

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
    this.lastSync = this.store.createRecord('am-app-sync', {
      id: 1,
      syncedOn: '2023-02-23T12:30:30.126797Z',
    });

    this.amApp = this.store.createRecord('am-app', {
      id: 1,
      project: this.project,
      latestAmAppVersion: this.latestAmAppVersion,
      lastSync: this.lastSync,
      isActive: true,
    });

    await render(hbs`
    <AppMonitoring::Details @amApp={{this.amApp}} />
  `);

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
    // Monitoring results are pending
    this.amApp = this.store.createRecord('am-app', {
      id: 1,
      project: this.project,
      latestAmAppVersion: this.latestAmAppVersion,
      lastSync: null,
      isActive: true,
    });

    await render(hbs`
    <AppMonitoring::Details @amApp={{this.amApp}} />
  `);

    assert
      .dom('[data-test-app-last-monitored-date] [data-test-ak-loader]')
      .exists();

    assert
      .dom('[data-test-app-last-monitored-date-pending-text]')
      .exists()
      .containsText('t:appMonitoringModule.syncInProgress:()');
  });

  test('it renders empty monitoring date if amApp has no last synced date and monitoring status is "INACTIVE"', async function (assert) {
    // Monitoring results are pending
    this.amApp = this.store.createRecord('am-app', {
      id: 1,
      project: this.project,
      latestAmAppVersion: this.latestAmAppVersion,
      lastSync: null,
      isActive: false,
    });

    await render(hbs`
    <AppMonitoring::Details @amApp={{this.amApp}} />
  `);

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
      this.amApp = this.store.createRecord('am-app', {
        id: 1,
        project: this.project,
        latestAmAppVersion: this.latestAmAppVersion,
        lastSync: null,
        isActive: status,
      });

      await render(hbs`
        <AppMonitoring::Details @amApp={{this.amApp}} />
      `);

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
      // ['monitoring-history', 't:appMonitoringModule.monitoringHistory:()'],
    ],
    async function (assert, [tabId, tabLabel]) {
      this.amApp = this.store.createRecord('am-app', {
        id: 1,
        project: this.project,
        latestAmAppVersion: this.latestAmAppVersion,
        lastSync: null,
      });

      await render(hbs`
        <AppMonitoring::Details @amApp={{this.amApp}} />
      `);

      assert
        .dom(`[data-test-app-details-tabs='${tabId}-tab']`)
        .exists()
        .hasText(tabLabel);
    }
  );
});
