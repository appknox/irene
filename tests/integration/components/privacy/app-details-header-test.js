import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, findAll, click, waitFor } from '@ember/test-helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { capitalize } from '@ember/string';

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

module(
  'Integration | Component | privacy/app-details-header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:organization', OrganizationStub);
      this.owner.register('service:notifications', NotificationsStub);

      this.store = this.owner.lookup('service:store');

      const file = this.server.create('file');

      const normalizedFile = this.store.normalize('file', {
        ...file.toJSON(),
      });

      const fileModel = this.store.push(normalizedFile);

      const project = this.server.create('project');

      const normalizedProject = this.store.normalize('project', {
        ...project.toJSON(),
      });

      const projectModel = this.store.push(normalizedProject);

      const privacyProject = this.server.create('privacy-project', {
        latest_file_privacy_analysis_status: ENUMS.PM_STATUS.COMPLETED,
        latest_file: file,
        project: project,
      });

      const normalizedPrivacyProject = this.store.normalize('privacy-project', {
        ...privacyProject.toJSON(),
        latest_file: fileModel.id,
        project: projectModel.id,
      });

      const privacyProjectModel = this.store.push(normalizedPrivacyProject);

      // Tracker Request Model
      this.server.create('tracker-request', {
        id: file.id,
      });

      // Tracker Model
      this.server.createList('tracker', 5);

      // Danger Perms Request Model
      this.server.create('dangerous-permission-request', {
        id: file.id,
      });

      // Danger Perms Model
      this.server.createList('dangerous-permission', 9);

      this.server.get('/v2/files/:id/tracker_request', () => {
        return {
          id: 2,
          file: file.id,
          status: ENUMS.PM_TRACKER_STATUS.SUCCESS,
        };
      });

      this.server.get(
        '/v2/tracker_request/:requestId/tracker_data',
        (schema) => {
          let trackers = schema.trackers.all().models;

          return {
            count: trackers.length,
            next: null,
            previous: null,
            results: trackers.map((t) => t.attrs),
          };
        }
      );

      this.server.get('/v2/files/:id/permission_request', () => {
        return {
          id: 2,
          file: file.id,
          status: ENUMS.PM_DANGER_PERMS_STATUS.SUCCESS,
        };
      });

      this.server.get(
        '/v2/permission_request/:requestId/permission_data',
        (schema) => {
          let permissions = schema.dangerousPermissionRequests.all().models;

          return {
            count: permissions.length,
            next: null,
            previous: null,
            results: permissions.map((t) => t.attrs),
          };
        }
      );

      this.server.get('/v2/files/:id/privacy_report', () => {
        return new Response(200);
      });

      this.setProperties({
        privacyProjectModel,
        projectModel,
        fileModel,
      });
    });

    test('it renders privacy app details header', async function (assert) {
      await render(
        hbs(
          `<PrivacyModule::AppDetails::Header @app={{this.privacyProjectModel}} />`
        )
      );

      assert.dom('[data-test-privacy-appDetails-header]').exists();

      assert
        .dom('[data-test-privacy-appDetails-header-fileName]')
        .exists()
        .hasText(this.fileModel.name);

      assert
        .dom('[data-test-privacy-appDetails-header-packageName]')
        .exists()
        .hasText(this.projectModel.packageName);

      assert
        .dom('[data-test-privacy-appDetails-header-viewReport-button]')
        .exists();

      assert
        .dom('[data-test-privacy-appDetails-header-fileSummary-expandButton]')
        .exists();

      assert
        .dom('[data-test-privacy-appDetails-header-fileSummary-section]')
        .doesNotExist();

      assert.dom('[data-test-privacy-appDetails-header-tabs]').exists();
    });

    test('it opens report drawer', async function (assert) {
      await render(
        hbs(
          `<PrivacyModule::AppDetails::Header @app={{this.privacyProjectModel}} />`
        )
      );

      assert
        .dom('[data-test-privacy-appDetails-header-viewReport-button]')
        .exists();

      await click('[data-test-privacy-appDetails-header-viewReport-button]');

      assert.dom('[data-test-privacyReportDrawer-drawer]').exists();

      assert
        .dom('[data-test-privacyReportDrawer-title]')
        .exists()
        .hasText(t('downloadReport'));

      assert.dom('[data-test-privacyReportDrawer-closeBtn]').isNotDisabled();

      assert.dom('[data-test-privacyReportDrawer-appDetails]').doesNotExist();

      assert
        .dom('[data-test-privacyReportDrawer-description]')
        .exists()
        .hasText(t('privacyModule.downloadReportDescription'));
    });

    test('it expands file summary with correct data', async function (assert) {
      await render(
        hbs(
          `<PrivacyModule::AppDetails::Header @app={{this.privacyProjectModel}} />`
        )
      );

      assert
        .dom('[data-test-privacy-appDetails-header-fileSummary-expandButton]')
        .exists();

      await click(
        '[data-test-privacy-appDetails-header-fileSummary-expandButton]'
      );

      assert
        .dom('[data-test-privacy-appDetails-header-fileSummary-section]')
        .exists();

      const fileSummaryLabels = findAll(
        '[data-test-privacy-appDetails-header-fileSummary-labels]'
      );

      const fileSummaryValues = findAll(
        '[data-test-privacy-appDetails-header-fileSummary-values]'
      );

      assert.dom(fileSummaryLabels[0]).hasText(t('version'));
      assert.dom(fileSummaryLabels[1]).hasText(capitalize(t('versionCode')));

      assert.dom(fileSummaryValues[0]).hasText(this.fileModel.version);
      assert.dom(fileSummaryValues[1]).hasText(this.fileModel.versionCode);
    });

    test('it renders inProgress state', async function (assert) {
      this.privacyProjectModel.latestFilePrivacyAnalysisStatus =
        ENUMS.PM_STATUS.IN_PROGRESS;

      render(hbs`
        <PrivacyModule::AppDetails::Header @app={{this.privacyProjectModel}} />
      `);

      await waitFor('[data-test-privacyModule-status]');

      assert
        .dom('[data-test-privacy-appDetails-header-viewReport-button]')
        .doesNotExist();

      assert
        .dom('[data-test-privacyModule-status-header]')
        .exists()
        .hasText(t('privacyModule.inProgressHeading'));

      assert
        .dom('[data-test-privacyModule-status-desc]')
        .exists()
        .hasText(t('privacyModule.inProgressDescription'));
    });

    test('it renders failed state', async function (assert) {
      this.privacyProjectModel.latestFilePrivacyAnalysisStatus =
        ENUMS.PM_STATUS.FAILED;

      render(hbs`
        <PrivacyModule::AppDetails::Header @app={{this.privacyProjectModel}} />
      `);

      await waitFor('[data-test-privacyModule-status]');

      assert
        .dom('[data-test-privacy-appDetails-header-viewReport-button]')
        .doesNotExist();

      assert
        .dom('[data-test-privacy-appDetails-header-failed-note]')
        .exists()
        .hasText(t('privacyModule.failedNote'));

      assert
        .dom('[data-test-privacyModule-status-header]')
        .exists()
        .hasText(t('privacyModule.failedHeading'));

      assert
        .dom('[data-test-privacyModule-status-desc]')
        .exists()
        .hasText(t('privacyModule.failedDescription'));
    });
  }
);
