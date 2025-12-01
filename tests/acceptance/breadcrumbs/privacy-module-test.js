import { visit, click, findAll } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import { assertBreadcrumbsUI } from 'irene/tests/helpers/breadcrumbs-utils';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

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

module('Acceptance | breadcrumbs/privacy-module', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    // service stubs
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    const { organization } = await setupRequiredEndpoints(this.server);
    setupFileModelEndpoints(this.server);

    organization.update({
      features: {
        privacy: true,
      },
    });

    const files = this.server.createList('file', 5);

    const projects = files.map((file) =>
      this.server.create('project', { last_file: file })
    );

    projects.map((project, idx) =>
      this.server.create('privacy-project', {
        project,
        latest_file: files[idx],
        latest_file_privacy_analysis_status: 1,
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

    this.server.get('/v2/privacy_project/:id', (schema, req) => {
      return schema.privacyProjects.find(req.params.id)?.toJSON();
    });

    this.setProperties({
      files,
    });
  });

  test('it checks privacy breadcrumbs', async function (assert) {
    assert.expect(6);

    await visit(`/dashboard/privacy-module`);

    const tableRow = findAll('[data-test-privacyModule-appListTable-row]');

    await click(tableRow[0]);

    assertBreadcrumbsUI(
      [t('privacyModule.title'), `${this.files[0].name}`],
      assert
    );

    //Go to Dangerous Permission
    await click(findAll('[data-test-ak-tab-item]')[1].querySelector('a'));

    assertBreadcrumbsUI(
      [t('privacyModule.title'), `${this.files[0].name}`],
      assert
    );
  });
});
