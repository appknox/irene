import { module, test } from 'qunit';
import { findAll, visit } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';

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

module('Acceptance | privacy-module/dangerous-permission', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization } = await setupRequiredEndpoints(this.server);

    organization.update({
      features: {
        privacy: true,
      },
    });

    const profile = this.server.create('profile');

    // File Model
    this.server.create('file', {
      id: 1,
      profile: profile.id,
    });

    // Tracker Request Model
    this.server.create('tracker-request', {
      id: 1,
    });

    // Tracker Model
    this.server.createList('tracker', 5);

    // Danger Perms Request Model
    this.server.create('dangerous-permission-request', {
      id: 1,
    });

    // Danger Perms Model
    const permissions = this.server.createList('dangerous-permission', 9);

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    // Server Mocks
    this.server.get('/v2/files/:id', (schema, req) => {
      const data = schema.files.find(`${req.params.id}`)?.toJSON();

      return { ...data };
    });

    this.server.get('/v2/files/:id/tracker_request', (schema, req) => {
      return { id: 2, file: 1, status: 2 };
    });

    this.server.get(
      '/v2/tracker_request/:requestId/tracker_data',
      (schema, req) => {
        let trackers = schema.trackers.all().models;

        return {
          count: trackers.length,
          next: null,
          previous: null,
          results: trackers.map((t) => t.attrs),
        };
      }
    );

    this.server.get('/v2/files/:id/permission_request', (schema, req) => {
      return { id: 2, file: 1, status: 2 };
    });

    this.server.get(
      '/v2/permission_request/:requestId/permission_data',
      (schema, req) => {
        let permissions = schema.dangerousPermissions.all().models;

        return {
          count: permissions.length,
          next: null,
          previous: null,
          results: permissions.map((t) => t.attrs),
        };
      }
    );

    this.setProperties({
      permissions,
    });

    const notify = this.owner.lookup('service:notifications');

    notify.setDefaultClearDuration(0);
  });

  test('it exists', async function (assert) {
    await visit(`/dashboard/privacy-module/1/danger-perms`);

    assert
      .dom('[data-test-privacyModule-dangerPerms-detectedTxt]')
      .exists()
      .hasText(t('privacyModule.dangerPermsDetected'));

    assert.dom('[data-test-privacyModule-dangerPerms-list]').exists();
  });

  test('it shows empty when no data', async function (assert) {
    this.server.get(
      '/v2/permission_request/:requestId/permission_data',
      (schema, req) => {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      }
    );

    await visit(`/dashboard/privacy-module/1/danger-perms`);

    assert
      .dom('[data-test-privacyModule-dangerPerms-detectedTxt]')
      .doesNotExist();

    assert.dom('[data-test-privacyModule-status]').exists();

    assert
      .dom('[data-test-privacyModule-status-header]')
      .exists()
      .hasText(t('privacyModule.emptyDangerPermsHeader'));

    assert
      .dom('[data-test-privacyModule-status-desc]')
      .exists()
      .hasText(t('privacyModule.emptyDangerPermsDesc'));
  });

  test('it shows correct permission name & category', async function (assert) {
    await visit(`/dashboard/privacy-module/1/danger-perms`);

    const expectedPermissionName = this.permissions[0].permission_name;
    const expectedCategory = this.permissions[0].category;

    const allPermissionName = findAll(
      '[data-test-privacyModule-dangerPerms-permissionName]'
    );

    assert.dom(allPermissionName[0]).exists().hasText(expectedPermissionName);

    const allCategories = findAll(
      '[data-test-privacyModule-dangerPerms-category]'
    );

    assert.dom(allCategories[0]).exists().hasText(expectedCategory);
  });
});
