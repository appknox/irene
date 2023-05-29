import {
  render,
  findAll,
  find,
  click,
  fillIn,
  triggerEvent,
  waitFor,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import dayjs from 'dayjs';

import { SbomScanStatus } from 'irene/models/sbom-scan';
import Service from '@ember/service';

class RouterStub extends Service {
  transitionToArgs = [];

  transitionTo() {
    this.transitionToArgs = arguments;
  }
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }
  success(msg) {
    this.successMsg = msg;
  }
}

module('Integration | Component | sbom/app-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const store = this.owner.lookup('service:store');
    const organizationMe = store.createRecord('organization-me', {
      is_owner: true,
      is_admin: true,
    });

    class OrganizationMeStub extends Service {
      org = organizationMe;
    }

    const files = this.server.createList('file', 5);

    const projects = files.map((file) =>
      this.server.create('project', { last_file_id: file.id })
    );

    const sbomScans = this.server.createList('sbom-scan', 5);

    const sbomApps = sbomScans.map((sbomScan) =>
      this.server.create('sbom-app', { latest_sb_file: sbomScan.id })
    );

    await this.owner.lookup('service:organization').load();

    const queryParams = {
      app_limit: 10,
      app_offset: 0,
      app_query: '',
    };

    this.setProperties({
      organization: this.owner.lookup('service:organization').selected,
      sbomApps,
      queryParams,
      projects,
      files,
    });

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:router', RouterStub);
  });

  test.each(
    'it renders sbom app list',
    [
      SbomScanStatus.PENDING,
      SbomScanStatus.IN_PROGRESS,
      SbomScanStatus.COMPLETED,
      SbomScanStatus.FAILED,
    ],
    async function (assert, status) {
      this.server.get('/v2/sb_projects', (schema) => {
        const results = schema.sbomApps.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/v2/sb_files/:id', (schema, req) => {
        const scan = schema.sbomScans.find(`${req.params.id}`)?.toJSON();

        if (scan && this.sbomApps[0].latest_sb_file === req.params.id) {
          scan.status = status;
        }

        if (scan.status !== SbomScanStatus.COMPLETED) {
          scan.completed_at = null;
        }

        return scan;
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      await render(hbs`
      <Sbom::AppList @queryParams={{this.queryParams}} />
    `);

      assert
        .dom('[data-test-sbomApp-title]')
        .hasText('t:sbomModule.sbomAppTitle:()');

      assert
        .dom('[data-test-sbomApp-description]')
        .hasText('t:sbomModule.sbomAppDescription:()');

      assert.dom('[data-test-sbomApp-table]').exists();

      const headerRow = find('[data-test-sbomApp-thead] tr').querySelectorAll(
        'th'
      );

      // assert header row
      assert.dom(headerRow[0]).hasText('t:platform:()');
      assert.dom(headerRow[1]).hasText('t:sbomModule.applicationName:()');
      assert.dom(headerRow[2]).hasText('t:sbomModule.lastSbomAnalysisOn:()');
      assert.dom(headerRow[3]).hasText('t:status:()');
      assert.dom(headerRow[4]).hasText('t:action:()');

      const contentRows = findAll('[data-test-sbomApp-row]');

      assert.strictEqual(contentRows.length, this.sbomApps.length);

      // first row sanity check
      const firstRow = contentRows[0].querySelectorAll(
        '[data-test-sbomApp-cell]'
      );

      assert.dom('[data-test-appPlatform-icon]', firstRow[0]).exists();
      // .hasClass(this.projects[0].platform_icon);

      assert.dom('[data-test-sbomApp-logo]', firstRow[1]).exists();

      assert
        .dom('[data-test-sbomApp-packageName]', firstRow[1])
        .hasText(this.projects[0].package_name);

      assert
        .dom('[data-test-sbomApp-name]', firstRow[1])
        .hasText(this.files[0].name);

      const sbomScan = this.server.db.sbomScans.find(
        this.sbomApps[0].latest_sb_file
      );

      assert
        .dom('[data-test-sbomApp-lastAnalysedOn]', firstRow[2])
        .hasText(
          status === SbomScanStatus.COMPLETED
            ? dayjs(sbomScan.completed_at).format('DD MMM YYYY')
            : '-'
        );

      assert.dom('[data-test-sbom-scanStatus]', firstRow[3]).hasAnyText();
      assert.dom('[data-test-sbomApp-actionBtn]', firstRow[4]).isNotDisabled();

      await click(firstRow[4].querySelector('[data-test-sbomApp-actionBtn]'));

      const menuItems = findAll('[data-test-sbomApp-actionMenuItem]');

      if (status === SbomScanStatus.COMPLETED) {
        assert.strictEqual(menuItems.length, 2);

        assert
          .dom('button', menuItems[1])
          .isNotDisabled()
          .hasText('t:sbomModule.viewReport:()');
      } else {
        assert.strictEqual(menuItems.length, 1);
      }

      assert.dom('a', menuItems[0]).hasText('t:sbomModule.pastSbomAnalyses:()');
    }
  );

  test('it renders sbom app list with no scans', async function (assert) {
    this.server.get('/v2/sb_projects', (schema) => {
      const results = schema.sbomApps.all().models;

      results[1].latest_sb_file = null;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_files/:id', (schema, req) => {
      return schema.sbomScans.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
      <Sbom::AppList @queryParams={{this.queryParams}} />
    `);

    const contentRows = findAll('[data-test-sbomApp-row]');

    assert.strictEqual(contentRows.length, this.sbomApps.length);

    // second row sanity check
    const secondRow = contentRows[1].querySelectorAll(
      '[data-test-sbomApp-cell]'
    );

    assert.dom('[data-test-appPlatform-icon]', secondRow[0]).exists();
    // .hasClass(this.projects[0].platform_icon);

    assert.dom('[data-test-sbomApp-logo]', secondRow[1]).exists();

    assert
      .dom('[data-test-sbomApp-packageName]', secondRow[1])
      .hasText(this.projects[1].package_name);

    assert
      .dom('[data-test-sbomApp-name]', secondRow[1])
      .hasText(this.files[1].name);

    assert.dom('[data-test-sbomApp-lastAnalysedOn]', secondRow[2]).hasText('-');

    assert
      .dom('[data-test-sbom-scanStatus]', secondRow[3])
      .hasText('t:chipStatus.neverInitiated:()');

    assert.dom('[data-test-sbomApp-actionBtn]', secondRow[4]).isDisabled();

    assert.dom('[data-test-sbomApp-noScanContainer]').doesNotExist();

    await click(contentRows[1]);

    assert.dom('[data-test-sbomApp-noScanContainer]').exists();
    assert.dom('[data-test-sbomApp-noScanCloseBtn]').isNotDisabled();
    assert.dom('[data-test-sbomApp-noScanSvg]').exists();

    assert
      .dom('[data-test-sbomApp-noScanTitle]')
      .hasText('t:sbomModule.neverInitiated:()');

    assert
      .dom('[data-test-sbomApp-noScanDescription]')
      .hasText('t:sbomModule.noScanAlertDescription:()');

    assert
      .dom('[data-test-sbomApp-noScanOkBtn]')
      .isNotDisabled()
      .hasText('t:ok:()');

    await click('[data-test-sbomApp-noScanOkBtn]');

    assert.dom('[data-test-sbomApp-noScanContainer]').doesNotExist();
  });

  test('it shows view report drawer for sbom app', async function (assert) {
    this.server.get('/v2/sb_projects', (schema) => {
      const results = schema.sbomApps.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_files/:id', (schema, req) => {
      const scan = schema.sbomScans.find(`${req.params.id}`)?.toJSON();

      if (scan && req.params.id === this.sbomApps[2].latest_sb_file) {
        scan.status = SbomScanStatus.COMPLETED;
      }

      return scan;
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
      <Sbom::AppList @queryParams={{this.queryParams}} />
    `);

    assert.dom('[data-test-sbomApp-table]').exists();

    const contentRows = findAll('[data-test-sbomApp-row]');

    assert.strictEqual(contentRows.length, this.sbomApps.length);

    // third row sanity check
    const thirdRow = contentRows[2].querySelectorAll(
      '[data-test-sbomApp-cell]'
    );

    assert.dom('[data-test-sbomApp-actionBtn]', thirdRow[4]).isNotDisabled();

    await click(thirdRow[4].querySelector('[data-test-sbomApp-actionBtn]'));

    const menuItems = findAll('[data-test-sbomApp-actionMenuItem]');

    assert.strictEqual(menuItems.length, 2);

    assert.dom('a', menuItems[0]).hasText('t:sbomModule.pastSbomAnalyses:()');

    assert
      .dom('button', menuItems[1])
      .isNotDisabled()
      .hasText('t:sbomModule.viewReport:()');

    const viewReportBtn = menuItems[1].querySelector('button');

    await click(viewReportBtn);

    assert.dom('[data-test-sbomApp-actionMenuItem]').doesNotExist();

    assert.dom('[data-test-sbomScanReportDrawer-drawer]').exists();

    assert
      .dom('[data-test-sbomScanReportDrawer-title]')
      .hasText('t:sbomModule.scanReports:()');

    assert.dom('[data-test-sbomScanReportDrawer-closeBtn]').isNotDisabled();

    assert
      .dom(
        '[data-test-appPlatform-icon]',
        find('[data-test-sbomScanReportDrawer-drawer]')
      )
      .exists();
    // .hasClass(this.projects[0].platform_icon);

    assert
      .dom(
        '[data-test-sbomApp-logo]',
        find('[data-test-sbomScanReportDrawer-drawer]')
      )
      .exists();

    assert
      .dom('[data-test-sbomScanReportDrawer-appName]')
      .hasText(this.files[2].name);

    assert
      .dom('[data-test-sbomScanReportDrawer-appPackageName]')
      .hasText(this.projects[2].package_name);

    assert
      .dom('[data-test-sbomScanReportDrawer-description]')
      .hasText('t:sbomModule.sbomDownloadReportDescription:()');
  });

  test.skip('test search in sbom app list', async function (assert) {
    this.server.get('/v2/sb_projects', (schema, req) => {
      this.set('query', req.queryParams.q);

      const results = schema.sbomApps.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_files/:id', (schema, req) => {
      return schema.sbomScans.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
      <Sbom::AppList @queryParams={{this.queryParams}} />
    `);

    assert
      .dom('[data-test-sbomApp-searchInput]')
      .isNotDisabled()
      .hasValue(this.queryParams.app_query);

    await fillIn('[data-test-sbomApp-searchInput]', 'some query');
    await triggerEvent('[data-test-sbomApp-searchInput]', 'keyup');

    assert
      .dom('[data-test-sbomApp-searchInput]')
      .isNotDisabled()
      .hasValue(this.queryParams.app_query);

    assert.strictEqual(this.query, this.queryParams.app_query);
  });

  test('test sbom app list row click', async function (assert) {
    this.server.get('/v2/sb_projects', (schema, req) => {
      this.set('query', req.queryParams.q);

      const results = schema.sbomApps.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_files/:id', (schema, req) => {
      const scan = schema.sbomScans.find(`${req.params.id}`)?.toJSON();

      if (scan && this.sbomApps[1].latest_sb_file === req.params.id) {
        scan.status = SbomScanStatus.COMPLETED;
      }

      return scan;
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
      <Sbom::AppList @queryParams={{this.queryParams}} />
    `);

    const contentRows = findAll('[data-test-sbomApp-row]');

    assert.strictEqual(contentRows.length, this.sbomApps.length);

    await click(contentRows[1]);

    const router = this.owner.lookup('service:router');
    const transitionToArgs = router.transitionToArgs;

    assert.true(transitionToArgs.length > 0);
    assert.strictEqual(
      transitionToArgs[0],
      'authenticated.dashboard.sbom.scan-details'
    );
    assert.strictEqual(transitionToArgs[1], this.sbomApps[1].id);

    assert.strictEqual(transitionToArgs[2], this.sbomApps[1].latest_sb_file);
  });

  test('it renders sbom app list loading & empty state', async function (assert) {
    this.server.get(
      '/v2/sb_projects',
      () => {
        return { count: 0, next: null, previous: null, results: [] };
      },
      { timing: 500 }
    );

    // not awaiting here as it stops execution till delayed response is recieved
    render(hbs`
      <Sbom::AppList @queryParams={{this.queryParams}} />
    `);

    await waitFor('[data-test-sbomApp-title]', { timeout: 500 });

    assert
      .dom('[data-test-sbomApp-title]')
      .hasText('t:sbomModule.sbomAppTitle:()');

    assert
      .dom('[data-test-sbomApp-description]')
      .hasText('t:sbomModule.sbomAppDescription:()');

    // assert
    //   .dom('[data-test-sbomApp-searchInput]')
    //   .isNotDisabled()
    //   .hasValue(this.queryParams.app_query);

    assert.dom('[data-test-sbomApp-table]').doesNotExist();

    assert.dom('[data-test-sbom-loadingSvg]').exists();

    assert.dom('[data-test-sbom-loader]').exists();
    assert.dom('[data-test-sbom-loadingText]').hasText('t:loading:()...');

    await waitFor('[data-test-sbomApp-emptyTextTitle]', { timeout: 500 });

    assert
      .dom('[data-test-sbomApp-emptyTextTitle]')
      .hasText('t:sbomModule.sbomAppEmptyText.title:()');

    assert
      .dom('[data-test-sbomApp-emptyTextDescription]')
      .hasText('t:sbomModule.sbomAppEmptyText.description:()');

    assert.dom('[data-test-sbomApp-emptySvg]').exists();
  });
});
