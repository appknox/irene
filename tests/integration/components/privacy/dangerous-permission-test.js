import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, findAll } from '@ember/test-helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

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
  'Integration | Component | privacy/dangerous-permission',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:organization', OrganizationStub);
      this.owner.register('service:notifications', NotificationsStub);

      const profile = this.server.create('profile');

      // File Model
      const file = this.server.create('file', {
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

      // Server Mocks
      this.server.get('/v3/files/:id', (schema, req) => {
        const data = schema.files.find(`${req.params.id}`)?.toJSON();

        return { ...data };
      });

      this.server.get('/v2/files/:id/tracker_request', () => {
        return { id: 2, file: 1, status: 2 };
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
        return { id: 2, file: 1, status: 2 };
      });

      this.server.get(
        '/v2/permission_request/:requestId/permission_data',
        (schema) => {
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
        file,
        queryParams: {
          app_limit: 10,
          app_offset: 0,
        },
      });
    });

    test('it exists', async function (assert) {
      await render(
        hbs(
          `<PrivacyModule::AppDetails::DangerousPermissions @queryParams={{this.queryParams}} @file={{this.file}}/>`
        )
      );

      assert
        .dom('[data-test-privacyModule-dangerPerms-detectedTxt]')
        .exists()
        .hasText(t('privacyModule.dangerPermsDetected'));

      assert.dom('[data-test-privacyModule-dangerPerms-list]').exists();
    });

    test('it shows empty when no data', async function (assert) {
      this.server.get(
        '/v2/permission_request/:requestId/permission_data',
        () => {
          return {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };
        }
      );

      await render(
        hbs(
          `<PrivacyModule::AppDetails::DangerousPermissions @queryParams={{this.queryParams}} @file={{this.file}}/>`
        )
      );

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
      await render(
        hbs(
          `<PrivacyModule::AppDetails::DangerousPermissions @queryParams={{this.queryParams}} @file={{this.file}}/>`
        )
      );

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
  }
);
