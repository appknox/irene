import { module, test } from 'qunit';
import { click, visit, findAll } from '@ember/test-helpers';
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

module('Acceptance | privacy-module/tracker', function (hooks) {
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
    const trackers = this.server.createList('tracker', 5);

    // Danger Perms Request Model
    this.server.create('dangerous-permission-request', {
      id: 1,
    });

    // Danger Perms Model
    this.server.createList('dangerous-permission', 9);

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
    });

    const notify = this.owner.lookup('service:notifications');

    notify.setDefaultClearDuration(0);
  });

  test('it exists', async function (assert) {
    await visit(`/dashboard/privacy-module/1/trackers`);

    assert
      .dom('[data-test-privacyModule-trackers-trackersDetectedTxt]')
      .exists()
      .hasText(t('privacyModule.trackerDetected'));

    assert.dom('[data-test-privacyModule-trackers-list]').exists();
  });

  test('it shows empty when no data', async function (assert) {
    this.server.get(
      '/v2/tracker_request/:requestId/tracker_data',
      (schema, req) => {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      }
    );

    await visit(`/dashboard/privacy-module/1/trackers`);

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
    await visit(`/dashboard/privacy-module/1/trackers`);

    const expectedName = this.trackers[0].name;

    const alltrackerName = findAll('[data-test-privacyModule-trackers-name]');

    assert.dom(alltrackerName[0]).exists().hasText(expectedName);
  });

  test('it opens drawer and shows data', async function (assert) {
    await visit(`/dashboard/privacy-module/1/trackers`);

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
