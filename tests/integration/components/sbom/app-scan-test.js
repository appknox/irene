import {
  render,
  findAll,
  find,
  click,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { SbomScanStatus } from 'irene/models/sbom-file';
import Service from '@ember/service';
import dayjs from 'dayjs';

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

module('Integration | Component | sbom/app-scan', function (hooks) {
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

    const file = this.server.create('file');
    const project = this.server.create('project', { last_file_id: file.id });

    const files = this.server.createList('file', 4);

    const projects = files.map((file) =>
      this.server.create('project', { last_file_id: file.id })
    );

    const sbomFiles = [file, ...files].map((file) =>
      this.server.create('sbom-file', { file: file.id })
    );

    const sbomProject = this.server.create('sbom-project', {
      latest_sb_file: sbomFiles[0].id,
    });

    const normalized = store.normalize('sbom-project', sbomProject.toJSON());

    await this.owner.lookup('service:organization').load();

    const queryParams = {
      scan_limit: 10,
      scan_offset: 0,
      scan_query: '',
    };

    this.setProperties({
      organization: this.owner.lookup('service:organization').selected,
      sbomProject: store.push(normalized),
      sbomFiles,
      projects: [project, ...projects],
      files: [file, ...files],
      queryParams,
    });

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
  });

  test.each(
    'it renders sbom app scans',
    [
      SbomScanStatus.PENDING,
      SbomScanStatus.IN_PROGRESS,
      SbomScanStatus.COMPLETED,
      SbomScanStatus.FAILED,
    ],
    async function (assert, status) {
      this.server.get('/v2/sb_projects/:id/sb_files', (schema) => {
        const results = schema.sbomFiles.all().models;

        results[0].status = status;

        results.forEach((r) => {
          if (r.status !== SbomScanStatus.COMPLETED) {
            r.completed_at = null;
          }
        });

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/v2/sb_projects/:id', (schema, req) => {
        return schema.sbomProjects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/sb_files/:id', (schema, req) => {
        return schema.sbomFiles.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      await render(hbs`
      <Sbom::AppScan @sbomProject={{this.sbomProject}} @queryParams={{this.queryParams}} />
    `);

      assert.dom('[data-test-appPlatform-icon]').exists();
      // .hasClass(this.projects[0].platform_icon);

      assert.dom('[data-test-appLogo-img]').exists();

      // latest project
      assert
        .dom('[data-test-sbomScan-appPackageName]')
        .hasText(this.projects[0].package_name);

      assert
        .dom('[data-test-sbomScan-title]')
        .hasText('t:sbomModule.pastSbomAnalyses:()');

      assert
        .dom('[data-test-sbomScan-description]')
        .hasText(
          `t:sbomModule.pastSbomAnalysesDescription:("projectName":"${this.files[0].name}")`
        );

      assert.dom('[data-test-sbomScan-table]').exists();

      const headerRow = find('[data-test-sbomScan-thead] tr').querySelectorAll(
        'th'
      );

      // assert header row
      assert.dom(headerRow[0]).hasText('t:sbomModule.applicationVersion:()');
      assert.dom(headerRow[1]).hasText('t:sbomModule.versionCode:()');
      assert.dom(headerRow[2]).hasText('t:sbomModule.sbomGeneratedOn:()');
      assert.dom(headerRow[3]).hasText('t:status:()');
      assert.dom(headerRow[4]).hasText('t:sbomModule.viewReport:()');

      const contentRows = findAll('[data-test-sbomScan-row]');

      assert.strictEqual(contentRows.length, this.sbomFiles.length);

      // first row sanity check
      const firstRow = contentRows[0].querySelectorAll(
        '[data-test-sbomScan-cell]'
      );

      assert.dom(firstRow[0]).hasText(`${this.files[0].version}`);
      assert.dom(firstRow[1]).hasText(`${this.files[0].version_code}`);

      assert
        .dom(firstRow[2])
        .hasText(
          status === SbomScanStatus.COMPLETED
            ? dayjs(this.sbomFiles[0].completed_at).format('DD MMM YYYY')
            : '-'
        );

      assert.dom('[data-test-sbom-scanStatus]', firstRow[3]).hasAnyText();

      if (status === SbomScanStatus.COMPLETED) {
        assert
          .dom('[data-test-sbomScan-viewReportBtn]', firstRow[4])
          .isNotDisabled();
      } else {
        assert
          .dom('[data-test-sbomScan-viewReportBtn]', firstRow[4])
          .isDisabled();
      }
    }
  );

  test('it renders view report drawer for sbom scan', async function (assert) {
    this.server.get('/v2/sb_projects/:id/sb_files', (schema) => {
      const results = schema.sbomFiles.all().models;

      results[2].status = SbomScanStatus.COMPLETED;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_files/:id', (schema, req) => {
      return schema.sbomFiles.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
      <Sbom::AppScan @sbomProject={{this.sbomProject}} @queryParams={{this.queryParams}} />
    `);

    const contentRows = findAll('[data-test-sbomScan-row]');

    assert.strictEqual(contentRows.length, this.sbomFiles.length);

    // third row sanity check
    const thirdRow = contentRows[2].querySelectorAll(
      '[data-test-sbomScan-cell]'
    );

    assert.dom(thirdRow[0]).hasText(`${this.files[2].version}`);
    assert.dom(thirdRow[1]).hasText(`${this.files[2].version_code}`);

    assert
      .dom(thirdRow[2])
      .hasText(dayjs(this.sbomFiles[2].completed_at).format('DD MMM YYYY'));

    assert.dom('[data-test-sbom-scanStatus]', thirdRow[3]).hasAnyText();

    assert
      .dom('[data-test-sbomScan-viewReportBtn]', thirdRow[4])
      .isNotDisabled();

    await click(
      thirdRow[4].querySelector('[data-test-sbomScan-viewReportBtn]')
    );

    assert.dom('[data-test-sbomReportDrawer-drawer]').exists();

    assert
      .dom('[data-test-sbomReportDrawer-title]')
      .hasText('t:sbomModule.scanReports:()');

    assert.dom('[data-test-sbomReportDrawer-closeBtn]').isNotDisabled();

    assert
      .dom(
        '[data-test-appPlatform-icon]',
        find('[data-test-sbomReportDrawer-drawer]')
      )
      .doesNotExist();

    assert
      .dom(
        '[data-test-appLogo-img]',
        find('[data-test-sbomReportDrawer-drawer]')
      )
      .doesNotExist();

    assert.dom('[data-test-sbomReportDrawer-appName]').doesNotExist();

    assert.dom('[data-test-sbomReportDrawer-appPackageName]').doesNotExist();

    assert
      .dom('[data-test-sbomReportDrawer-description]')
      .hasText('t:sbomModule.sbomDownloadReportDescription:()');
  });

  test('test sbom app scans loading & empty state', async function (assert) {
    this.server.get(
      '/v2/sb_projects/:id/sb_files',
      () => {
        return { count: 0, next: null, previous: null, results: [] };
      },
      { timing: 500 }
    );

    this.server.get('/v2/sb_files/:id', (schema, req) => {
      return schema.sbomFiles.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    // not awaiting here as it stops execution till delayed response is recieved
    render(hbs`
      <Sbom::AppScan @sbomProject={{this.sbomProject}} @queryParams={{this.queryParams}} />
    `);

    await waitUntil(
      () =>
        find('[data-test-sbomScan-description]').textContent.includes(
          this.files[0].name
        ),
      { timeout: 500 }
    );

    assert.dom('[data-test-appPlatform-icon]').exists();
    // .hasClass(this.projects[0].platform_icon);

    assert.dom('[data-test-appLogo-img]').exists();

    // latest project
    assert
      .dom('[data-test-sbomScan-appPackageName]')
      .hasText(this.projects[0].package_name);

    assert
      .dom('[data-test-sbomScan-title]')
      .hasText('t:sbomModule.pastSbomAnalyses:()');

    assert
      .dom('[data-test-sbomScan-description]')
      .hasText(
        `t:sbomModule.pastSbomAnalysesDescription:("projectName":"${this.files[0].name}")`
      );

    assert.dom('[data-test-sbomScan-table]').doesNotExist();

    assert.dom('[data-test-sbom-loadingSvg]').exists();

    assert.dom('[data-test-sbom-loader]').exists();
    assert.dom('[data-test-sbom-loadingText]').hasText('t:loading:()...');

    await waitFor('[data-test-sbomScan-emptyTextTitle]', { timeout: 500 });

    assert
      .dom('[data-test-sbomScan-emptyTextTitle]')
      .hasText('t:sbomModule.appScanEmptyText.title:()');

    assert
      .dom('[data-test-sbomScan-emptyTextDescription]')
      .hasText('t:sbomModule.appScanEmptyText.description:()');

    assert.dom('[data-test-sbomScan-emptySvg]').exists();
  });
});
