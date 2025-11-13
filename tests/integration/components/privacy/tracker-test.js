import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, findAll, click } from '@ember/test-helpers';
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

module('Integration | Component | privacy/tracker', function (hooks) {
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
    const trackers = this.server.createList('tracker', 5);

    // Danger Perms Request Model
    this.server.create('dangerous-permission-request', {
      id: 1,
    });

    // Danger Perms Model
    this.server.createList('dangerous-permission', 9);

    // Server Mocks
    this.server.get('/v3/files/:id', (schema, req) => {
      const data = schema.files.find(`${req.params.id}`)?.toJSON();

      return { ...data };
    });

    this.server.get('/v2/files/:id/tracker_request', () => {
      return { id: 2, file: 1, status: 2 };
    });

    this.server.get('/v2/tracker_request/:requestId/tracker_data', (schema) => {
      let trackers = schema.trackers.all().models;

      return {
        count: trackers.length,
        next: null,
        previous: null,
        results: trackers.map((t) => t.attrs),
      };
    });

    this.server.get('/v2/files/:id/permission_request', () => {
      return { id: 2, file: 1, status: 2 };
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

    this.setProperties({
      trackers,
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
        `<PrivacyModule::AppDetails::Trackers @queryParams={{this.queryParams}} @file={{this.file}}/>`
      )
    );

    assert
      .dom('[data-test-privacyModule-trackers-trackersDetectedTxt]')
      .exists()
      .hasText(t('privacyModule.trackerDetected'));

    assert.dom('[data-test-privacyModule-trackers-list]').exists();
  });

  test('it shows empty when no data', async function (assert) {
    this.server.get('/v2/tracker_request/:requestId/tracker_data', () => {
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    });

    await render(
      hbs(
        `<PrivacyModule::AppDetails::Trackers @queryParams={{this.queryParams}} @file={{this.file}}/>`
      )
    );

    assert
      .dom('[data-test-privacyModule-trackers-trackersDetectedTxt]')
      .doesNotExist();

    assert.dom('[data-test-privacyModule-status]').exists();

    assert
      .dom('[data-test-privacyModule-status-header]')
      .exists()
      .hasText(t('privacyModule.emptyTrackersHeader'));

    assert
      .dom('[data-test-privacyModule-status-desc]')
      .exists()
      .hasText(t('privacyModule.emptyTrackersDesc'));
  });

  test('it shows correct name of tracker', async function (assert) {
    await render(
      hbs(
        `<PrivacyModule::AppDetails::Trackers @queryParams={{this.queryParams}} @file={{this.file}}/>`
      )
    );

    const expectedName = this.trackers[0].name;

    const alltrackerName = findAll('[data-test-privacyModule-trackers-name]');

    assert.dom(alltrackerName[0]).exists().hasText(expectedName);
  });

  test('it opens drawer and shows data', async function (assert) {
    await render(
      hbs(
        `<PrivacyModule::AppDetails::Trackers @queryParams={{this.queryParams}} @file={{this.file}}/>`
      )
    );

    const expectedName = this.trackers[0].name;

    const alltrackerName = findAll('[data-test-privacyModule-trackers-name]');

    await click(alltrackerName[0]);

    assert
      .dom('[data-test-privacyModule-trackers-drawer-header]')
      .exists()
      .hasText(t('privacyModule.trackerDrawerHeader'));

    assert
      .dom('[data-test-privacyModule-trackers-drawer-name-label]')
      .exists()
      .hasText(t('privacyModule.nameOfTracker'));

    assert
      .dom('[data-test-privacyModule-trackers-drawer-name]')
      .exists()
      .hasText(expectedName);
  });
});
