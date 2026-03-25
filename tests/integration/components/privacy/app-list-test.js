import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import {
  render,
  findAll,
  find,
  click,
  waitFor,
  fillIn,
} from '@ember/test-helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { faker } from '@faker-js/faker';

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

class OrganizationMeStub extends Service {
  org = {
    is_owner: true,
  };
}

class RouterStub extends Service {
  currentRouteName = 'authenticated.dashboard.privacy-module';

  transitionTo(routeNameOrQueryParams) {
    this.currentRouteName = routeNameOrQueryParams;
  }
}

module('Integration | Component | privacy/app-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.owner.register('service:organization', OrganizationStub);
    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.unregister('service:router');
    this.owner.register('service:router', RouterStub);

    const files = this.server.createList('file', 5);

    const projects = files.map((file, i) =>
      this.server.create('project', {
        last_file: file,
        platform:
          i === 2 ? 0 : i === 1 ? 1 : faker.helpers.arrayElement([0, 1]),
      })
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
        app_query: '',
        app_platform: null,
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

  test('it renders searched privacy app list', async function (assert) {
    this.server.get('/v2/privacy_project', (schema, req) => {
      const search = (req.queryParams.package_name || '').toLowerCase();

      let records = schema.privacyProjects.all().models;

      if (search) {
        records = records.filter((record) =>
          record.project?.package_name?.toLowerCase().includes(search)
        );
      }

      return {
        count: records.length,
        next: null,
        previous: null,
        results: records.map((record) => record.attrs),
      };
    });

    await render(
      hbs(`<PrivacyModule::AppList @queryParams={{this.queryParams}} />`)
    );

    // Search Query is set to URL for the first project item
    await fillIn(
      '[data-test-privacyModule-appListHeader-searchQueryInput]',
      this.projects[0].package_name
    );

    let policyAppContentRows = findAll(
      '[data-test-privacyModule-appListTable-row]'
    );

    assert.strictEqual(
      policyAppContentRows.length,
      1,
      'Contains correct number of privacy projects matching search query.'
    );

    await click('[data-test-privacyModule-appListHeader-clearButton]');

    policyAppContentRows = findAll(
      '[data-test-privacyModule-appListTable-row]'
    );

    assert.strictEqual(
      policyAppContentRows.length,
      this.privacyProjects.length,
      'Contains all privacy projects.'
    );
  });

  test('It filters privacy project list when platform value changes', async function (assert) {
    this.server.get('/v2/privacy_project', (schema, req) => {
      const platform = (req.queryParams.platform || '').toLowerCase();

      let records = schema.privacyProjects.all().models;

      if (platform && platform !== undefined && Number(platform) !== -1) {
        records = records.filter(
          (record) => Number(record.project?.platform) === Number(platform)
        );
      }

      return {
        count: records.length,
        next: null,
        previous: null,
        results: records.map((record) => ({
          ...record.attrs,
          project: record.project?.id,
          latest_file: record.latest_file?.id,
        })),
      };
    });

    await render(
      hbs(`<PrivacyModule::AppList @queryParams={{this.queryParams}} />`)
    );

    await clickTrigger(
      '[data-test-privacyModule-appListHeader-select-platform-container]'
    );

    await waitFor('.ember-power-select-option', { timeout: 1000 });

    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      1
    );

    let policyAppContentRows = findAll(
      '[data-test-privacyModule-appListTable-row]'
    );

    assert.strictEqual(
      this.privacyProjects.filter((p) => p.project.platform === 0).length,
      policyAppContentRows.length,
      'Privacy project list items all have platform values matching "0".'
    );

    // Selecting a platform value equal to 1 from the plaform filter options
    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      2
    );

    policyAppContentRows = findAll(
      '[data-test-privacyModule-appListTable-row]'
    );

    assert.strictEqual(
      this.privacyProjects.filter((p) => p.project.platform === 1).length,
      policyAppContentRows.length,
      'Privacy project list items all have platform values matching "1".'
    );

    // Selecting a platform value equal to -1 from the plaform filter options
    // This should return the entire project list
    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      0
    );

    policyAppContentRows = findAll(
      '[data-test-privacyModule-appListTable-row]'
    );

    assert.strictEqual(
      this.privacyProjects.length,
      policyAppContentRows.length,
      'Privacy project list defaults to complete list when platform value is "-1".'
    );
  });

  test('it shows settings icon and opens drawer on click', async function (assert) {
    this.server.get('/organizations/:id/ai_features', () => ({
      pii: true,
      reporting: true,
    }));

    this.server.get('/v2/privacy_geo_settings', () => ({
      id: 1,
      custom_countries: ['SG', 'AU'],
      geo_settings: [
        { value: false, settings_parameter: 'geo_in' },
        { value: true, settings_parameter: 'geo_us' },
      ],
      version: 1,
    }));

    await render(
      hbs(`<PrivacyModule::AppList @queryParams={{this.queryParams}} />`)
    );

    assert.dom('[data-test-privacyModule-appListHeader-settingsIcon]').exists();

    await click('[data-test-privacyModule-appListHeader-settingsIcon]');

    await waitFor('[data-test-privacy-settings-save-button]', {
      timeout: 2000,
    });

    assert
      .dom('[data-test-privacy-settings-pii-toggle-header]')
      .exists()
      .hasText(t('privacyModule.piiVisibility'));

    assert.dom('[data-test-privacy-settings-save-button]').exists();
    assert.dom('[data-test-privacy-settings-cancel-button]').exists();
  });

  test('it hides PII tab when PII feature is disabled', async function (assert) {
    this.server.get('/organizations/:id/ai_features', () => ({
      pii: false,
      reporting: true,
    }));

    this.server.get('/v2/privacy_geo_settings', () => ({
      id: 1,
      custom_countries: ['SG', 'AU'],
      geo_settings: [
        { value: false, settings_parameter: 'geo_in' },
        { value: true, settings_parameter: 'geo_us' },
      ],
      version: 1,
    }));

    await render(
      hbs(`<PrivacyModule::AppList @queryParams={{this.queryParams}} />`)
    );

    await click('[data-test-privacyModule-appListHeader-settingsIcon]');

    await waitFor('[data-test-privacy-settings-save-button]', {
      timeout: 2000,
    });

    assert.dom('[data-test-privacy-settings-save-button]').exists();

    assert.dom('[data-test-privacy-settings-pii-toggle-header]').doesNotExist();
  });
});
