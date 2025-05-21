import { visit } from '@ember/test-helpers';

import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRequiredEndpoints } from '../../helpers/acceptance-utils';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { Response } from 'miragejs';
import { t } from 'ember-intl/test-support';

import ENUMS from 'irene/enums';

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isPendoEnabled() {
    return false;
  }

  isCrispEnabled() {
    return false;
  }
}

class WebsocketStub extends Service {
  async connect() {}

  async configure() {}
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }

  setDefaultAutoClear() {}
}

module('Acceptance | file-details/scan-coverage', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test.each(
    'it renders the correct scan coverage status (old files and files with no DAST Scan)',
    [400, 410],
    async function (assert, status) {
      const { organization } = await setupRequiredEndpoints(this.server);

      organization.update({
        features: {
          dynamicscan_automation: true,
        },
      });

      // Models
      const project = this.server.create('project');
      const profile = this.server.create('profile', { id: '1' });

      const file = this.server.create('file', {
        is_static_done: true,
        is_active: true,
        project: project.id,
        profile: profile.id,
        last_automated_dynamic_scan: null,
        last_manual_dynamic_scan: null,
        dev_framework: ENUMS.FILE_DEV_FRAMEWORK.UNKNOWN,
      });

      // service stubs
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:integration', IntegrationStub);
      this.owner.register('service:websocket', WebsocketStub);

      // lookup services
      this.breadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

      // server api interception
      this.server.get('/v2/server_configuration', () => ({
        devicefarm_url: 'https://devicefarm.app.com',
        websocket: '',
        enterprise: false,
        url_upload_allowed: false,
      }));

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/v2/dynamicscans/:id', (schema, req) => {
        return schema.dynamicscans.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('v2/profiles/:id/automation_preference', (_, req) => {
        return { id: req.params.id, dynamic_scan_automation_enabled: true };
      });

      this.server.get('/v2/files/:id/screen_coverage', () => {
        return new Response(status, {}, {});
      });

      // Test start
      await visit(
        `/dashboard/file/${file.id}/dynamic-scan/results/scan-coverage`
      );

      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-results-scanCoverage-status-unsupported-svg]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-results-scanCoverage-status-text]'
        )
        .hasText(t('scanCoverage.unsupported.title'));

      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-results-scanCoverage-status-subtext]'
        )
        .hasText(t('scanCoverage.unsupported.description'));
    }
  );
});
