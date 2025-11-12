import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, findAll, find, click, waitFor } from '@ember/test-helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

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

class OrganizationStub extends Service {
  selected = {
    id: 1,
    features: {
      privacy: true,
    },
  };
}

module('Integration | Component | privacy/app-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.owner.register('service:organization', OrganizationStub);
    this.owner.register('service:notifications', NotificationsStub);

    const files = this.server.createList('file', 5);

    const projects = files.map((file) =>
      this.server.create('project', { last_file: file })
    );

    const privacyProjects = projects.map((project, idx) =>
      this.server.create('privacy-project', {
        project,
        latest_file: files[idx],
      })
    );

    this.server.get('/v2/privacy_project', (schema) => {
      let records = schema.privacyProjects.all().models;

      return {
        count: records.length,
        next: null,
        previous: null,
        results: records.map((record) => ({
          ...record.attrs,
          highlight: false,
          project: record.project?.id,
          latest_file: record.latest_file?.id,
        })),
      };
    });

    this.server.get('/v3/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v3/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id/privacy_report', () => {
      return new Response(200);
    });

    this.setProperties({
      files,
      projects,
      privacyProjects,
      queryParams: {
        app_limit: 10,
        app_offset: 0,
      },
    });
  });

  test('it renders privacy app list', async function (assert) {
    await render(
      hbs(`<PrivacyModule::AppList @queryParams={{this.queryParams}} />`)
    );

    assert
      .dom('[data-test-privacyModule-appListHeader-headingText]')
      .exists()
      .hasText(t('privacyModule.title'));

    assert
      .dom('[data-test-privacyModule-appListHeader-subText]')
      .exists()
      .hasText(t('privacyModule.description'));

    const projectHeaderRows = findAll(
      '[data-test-privacyModule-appListTable-thead] th'
    );

    assert.dom(projectHeaderRows[0]).hasText(t('platform'));
    assert.dom(projectHeaderRows[1]).hasText(t('application'));
    assert.dom(projectHeaderRows[2]).hasText(t('privacyModule.lastScannedOn'));
    assert.dom(projectHeaderRows[3]).hasText(t('status'));
    assert.dom(projectHeaderRows[4]).hasText(t('action'));

    const policyAppContentRows = findAll(
      '[data-test-privacyModule-appListTable-row]'
    );

    assert.strictEqual(
      policyAppContentRows.length,
      this.privacyProjects.length
    );

    assert
      .dom('[data-test-privacy-packageName]', policyAppContentRows[1])
      .hasText(this.projects[1].package_name);

    assert
      .dom('[data-test-privacy-name]', policyAppContentRows[1])
      .hasText(this.files[1].name);

    assert
      .dom('[data-test-privacy-scanStatus]', policyAppContentRows[3])
      .hasAnyText();

    assert
      .dom(
        '[data-test-privacy-module-unread-mark="read"]',
        policyAppContentRows[1]
      )
      .exists();
  });

  test.each(
    'it should show right dropdown according to status',
    [
      {
        status: ENUMS.PM_STATUS.IN_PROGRESS,
        showReportButton: false,
      },
      {
        status: ENUMS.PM_STATUS.COMPLETED,
        showReportButton: true,
      },
      {
        status: ENUMS.PM_STATUS.FAILED,
        showReportButton: false,
      },
    ],
    async function (assert, { status, showReportButton }) {
      this.server.get('/v2/privacy_project', (schema) => {
        let projects = schema.privacyProjects.all().models;

        return {
          count: projects.length,
          next: null,
          previous: null,
          results: projects.map((t) => ({
            ...t.attrs,
            latest_file_privacy_analysis_status: status,
            project: t.project?.id,
            latest_file: t.latest_file?.id,
          })),
        };
      });

      await render(
        hbs(`<PrivacyModule::AppList @queryParams={{this.queryParams}} />`)
      );

      const policyAppContentRows = findAll(
        '[data-test-privacyModule-appListTable-row]'
      );

      assert
        .dom('[data-test-privacy-actionButton]', policyAppContentRows[1])
        .exists();

      await click('[data-test-privacy-actionButton]');

      assert
        .dom('[data-test-privacy-viewScanDetails-button]')
        .exists()
        .hasText(t('privacyModule.viewScanDetails'));

      if (showReportButton) {
        assert
          .dom('[data-test-privacy-viewReport-button]')
          .exists()
          .hasText(t('viewReport'));
      }
    }
  );

  test('it opens drawer with correct data', async function (assert) {
    this.server.get('/v2/privacy_project', (schema) => {
      let projects = schema.privacyProjects.all().models;

      return {
        count: projects.length,
        next: null,
        previous: null,
        results: projects.map((t) => ({
          ...t.attrs,
          latest_file_privacy_analysis_status: ENUMS.PM_STATUS.COMPLETED,
          project: t.project?.id,
          latest_file: t.latest_file?.id,
        })),
      };
    });

    await render(
      hbs(`<PrivacyModule::AppList @queryParams={{this.queryParams}} />`)
    );

    const policyAppContentRows = findAll(
      '[data-test-privacyModule-appListTable-row]'
    );

    assert
      .dom('[data-test-privacy-actionButton]', policyAppContentRows[0])
      .exists();

    await click('[data-test-privacy-actionButton]');

    assert
      .dom('[data-test-privacy-viewReport-button]')
      .exists()
      .hasText(t('viewReport'));

    await click('[data-test-privacy-viewReport-button]');

    assert.dom('[data-test-privacy-viewReport-button]').doesNotExist();

    assert.dom('[data-test-privacyReportDrawer-drawer]').exists();

    assert
      .dom('[data-test-privacyReportDrawer-title]')
      .hasText(t('downloadReport'));

    assert.dom('[data-test-privacyReportDrawer-closeBtn]').isNotDisabled();

    assert
      .dom(
        '[data-test-privacy-appPlatform-container]',
        find('[data-test-privacyReportDrawer-drawer]')
      )
      .exists();

    assert
      .dom(
        '[data-test-appLogo-img]',
        find('[data-test-privacyReportDrawer-drawer]')
      )
      .exists();

    assert
      .dom('[data-test-privacyReportDrawer-appName]')
      .hasText(this.files[0].name);

    assert
      .dom('[data-test-privacyReportDrawer-description]')
      .hasText(t('privacyModule.downloadReportDescription'));
  });

  test('it renders privacy app list loading & empty state', async function (assert) {
    this.server.get(
      '/v2/privacy_project',
      () => {
        return { count: 0, next: null, previous: null, results: [] };
      },
      { timing: 500 }
    );

    render(hbs`
      <PrivacyModule::AppList @queryParams={{this.queryParams}} />
    `);

    await waitFor('[data-test-privacyModule-appListHeader-headingText]', {
      timeout: 500,
    });

    assert
      .dom('[data-test-privacyModule-appListHeader-headingText]')
      .exists()
      .hasText(t('privacyModule.title'));

    assert
      .dom('[data-test-privacyModule-appListHeader-subText]')
      .exists()
      .hasText(t('privacyModule.description'));

    assert.dom('[data-test-ak-table-loading-row]').exists();

    await waitFor('[data-test-privacyModule-status-header]', { timeout: 500 });

    assert
      .dom('[data-test-privacyModule-status-header]')
      .exists()
      .hasText(t('privacyModule.appListEmptyHeader'));

    assert
      .dom('[data-test-privacyModule-status-desc]')
      .exists()
      .hasText(t('privacyModule.appListEmptyDescription'));
  });

  test('it shows unread when highlight true', async function (assert) {
    this.server.get('/v2/privacy_project', (schema) => {
      let projects = schema.privacyProjects.all().models;

      return {
        count: projects.length,
        next: null,
        previous: null,
        results: projects.map((t) => ({
          ...t.attrs,
          highlight: true,
          project: t.project?.id,
          latest_file: t.latest_file?.id,
        })),
      };
    });

    await render(
      hbs(`<PrivacyModule::AppList @queryParams={{this.queryParams}} />`)
    );

    const policyAppContentRows = findAll(
      '[data-test-privacyModule-appListTable-row]'
    );

    assert
      .dom(
        '[data-test-privacy-module-unread-mark="unread"]',
        policyAppContentRows[1]
      )
      .exists();
  });
});
