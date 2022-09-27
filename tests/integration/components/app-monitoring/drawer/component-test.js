import { render } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import styles from 'irene/components/app-monitoring/drawer/index.scss';
import { module, test } from 'qunit';

module('Integration | Component | app-monitoring/drawer', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.lastFile = this.server.create('file');
    this.latestAmAppVersion = this.server.create('am-app-version');
    this.lastSync = this.server.create('am-app-sync');

    this.project = this.server.create('project', {
      lastFile: this.lastFile,
      platformIconClass: 'apple',
    });

    this.settings = {
      id: 1,
      enabled: true,
    };

    this.closeDrawer = function () {
      return;
    };
  });

  test('it renders with the right data assuming monitoring is enabled and settings is active', async function (assert) {
    this.amApp = this.server.create('am-app', 1, {
      project: this.project,
      latestAmAppVersion: this.latestAmAppVersion,
      isActive: true,
      lastSync: this.lastSync,
    });

    this.settings.enabled = true;

    await render(hbs`
      <AppMonitoring::Drawer
        @showRightDrawer={{true}}
        @appDetails={{this.amApp}}
        @closeModalHandler={{this.closeDrawer}}
        @settings={{this.settings}}
      />
    `);

    assert.dom('[data-test-am-drawer-container]').exists();
    assert.dom('[data-test-header-close-icon]').exists();
    assert.dom('[data-test-header-title]').exists();
    assert
      .dom('[data-test-app-name]')
      .hasText(`${this.amApp.project.lastFile.name}`);
    assert
      .dom('[data-test-app-namespace]')
      .hasText(`${this.amApp.project.packageName}`);

    assert
      .dom('[data-test-app-platform]')
      .hasClass(styles[`platform-${this.amApp.project.platformIconClass}`]);

    assert
      .dom('[data-test-app-last-scanned-version]')
      .hasText(`${this.amApp.project.lastFile.comparableVersion}`);

    assert
      .dom('[data-test-app-store-version]')
      .hasText(`${this.amApp.latestAmAppVersion.comparableVersion}`);

    // In this scenario settings === true and isActive === true
    assert
      .dom('[data-test-am-app-status] [data-test-am-status-element]')
      .exists()
      .hasText('t:activeCaptital:()');

    assert
      .dom('[data-test-am-app-status] [data-test-am-app-last-sync]')
      .exists()
      .containsText(
        `${new dayjs(this.amApp.lastSync.syncedOn).format('DD MMM YYYY')}`
      );
  });

  test('it renders with the right data assuming monitoring is enabled and settings is inactive', async function (assert) {
    this.amApp = this.server.create('am-app', 1, {
      project: this.project,
      latestAmAppVersion: this.latestAmAppVersion,
      isActive: true,
      lastSync: this.lastSync,
    });

    this.settings.enabled = false;

    await render(hbs`
    <AppMonitoring::Drawer
      @showRightDrawer={{true}}
      @appDetails={{this.amApp}}
      @closeModalHandler={{this.closeDrawer}}
      @settings={{this.settings}}
    />
  `);

    assert.dom('[data-test-am-drawer-container]').exists();
    assert.dom('[data-test-header-close-icon]').exists();
    assert.dom('[data-test-header-title]').exists();
    assert
      .dom('[data-test-app-name]')
      .hasText(`${this.amApp.project.lastFile.name}`);
    assert
      .dom('[data-test-app-namespace]')
      .hasText(`${this.amApp.project.packageName}`);

    assert
      .dom('[data-test-app-platform]')
      .hasClass(styles[`platform-${this.amApp.project.platformIconClass}`]);

    assert
      .dom('[data-test-app-last-scanned-version]')
      .hasText(`${this.amApp.project.lastFile.comparableVersion}`);

    assert
      .dom('[data-test-app-store-version]')
      .hasText(`${this.amApp.latestAmAppVersion.comparableVersion}`);

    assert
      .dom('[data-test-am-app-status] [data-test-am-status-element]')
      .exists();

    // In this scenario settings === true and isActive === true
    assert
      .dom('[data-test-am-app-status] [data-test-am-status-element]')
      .exists()
      .hasText('t:inactiveCaptital:()');

    assert
      .dom('[data-test-am-app-status] [data-test-am-app-last-sync]')
      .exists()
      .containsText(
        `${new dayjs(this.amApp.lastSync.syncedOn).format('DD MMM YYYY')}`
      );
  });

  test('it renders "PENDING" status in store version column if comparableVersion is empty and lastSync are null', async function (assert) {
    this.latestAmAppVersion = this.server.create('am-app-version', {
      comparableVersion: null,
    });

    this.amApp = this.server.create('am-app', 1, {
      project: this.project,
      latestAmAppVersion: this.latestAmAppVersion,
      lastSync: null,
      isActive: true,
    });

    this.settings.enabled = true;

    await render(hbs`
    <AppMonitoring::Drawer
      @showRightDrawer={{true}}
      @appDetails={{this.amApp}}
      @closeModalHandler={{this.closeDrawer}}
      @settings={{this.settings}}
    />
  `);

    assert.dom('[data-test-am-drawer-container]').exists();
    assert.dom('[data-test-header-close-icon]').exists();
    assert.dom('[data-test-header-title]').exists();

    assert
      .dom('[data-test-app-store-version] [data-test-am-status-element]')
      .exists()
      .hasText(`t:pending:()`);
  });

  test('it renders "NOT FOUND" status in store version column if comparableVersion is empty and latestAmAppVersion is null', async function (assert) {
    this.latestAmAppVersion = this.server.create('am-app-version', {
      comparableVersion: '',
    });

    this.amApp = this.server.create('am-app', 1, {
      project: this.project,
      latestAmAppVersion: null,
      lastSync: this.lastSync,
      isActive: true,
    });

    this.settings.enabled = true;

    await render(hbs`
    <AppMonitoring::Drawer
      @showRightDrawer={{true}}
      @appDetails={{this.amApp}}
      @closeModalHandler={{this.closeDrawer}}
      @settings={{this.settings}}
    />
  `);

    assert.dom('[data-test-am-drawer-container]').exists();
    assert.dom('[data-test-header-close-icon]').exists();
    assert.dom('[data-test-header-title]').exists();

    assert
      .dom('[data-test-app-store-version] [data-test-am-status-element]')
      .exists()
      .hasText(`t:notFound:()`);
  });

  test('it hides drawer when "showRightDrawer" property is set to false', async function (assert) {
    await render(hbs`
    <AppMonitoring::Drawer
      @showRightDrawer={{false}}
      @appDetails={{this.amApp}}
      @closeModalHandler={{this.closeDrawer}}
      />
      `);

    assert
      .dom('[data-test-am-drawer-container]')
      .doesNotHaveClass(
        'open',
        "Drawer container element does not have a 'open' class"
      );

    assert
      .dom('[data-test-am-drawer-container]')
      .hasStyle(
        { opacity: '0', zIndex: '-1' },
        'Has a style of { opacity: 1, zIndex: -1 }'
      );

    assert
      .dom('[data-test-modal-content]')
      .doesNotHaveClass(
        'open',
        "Drawer content element does not have an 'open' class"
      );
  });

  test('it renders alert icon in store version field when latestFile in latestAmAppVersion is null', async function (assert) {
    this.latestAmAppVersion = this.server.create('am-app-version', {
      latestFile: null,
    });

    this.amApp = this.server.create('am-app', 1, {
      project: this.project,
      latestAmAppVersion: this.latestAmAppVersion,
      lastSync: this.lastSync,
      isActive: true,
    });

    await render(
      hbs`
      <AppMonitoring::Drawer
        @showRightDrawer={{true}}
        @appDetails={{this.amApp}}
        @closeModalHandler={{this.closeDrawer}}
        @settings={{this.settings}}
      />`
    );
    assert.dom('[data-test-app-warning-icon]').exists();
    assert
      .dom('[data-test-app-warning-tooltip]')
      .hasText(`t:appMonitoringErrors.akUnscannedVersion:()`);
  });
});
